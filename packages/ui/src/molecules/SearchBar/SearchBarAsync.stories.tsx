import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { SearchBarAsync } from "./SearchBarAsync";
import type { SearchBarItem } from "./SearchBar";

/**
 * SearchBarAsync — busca no back com debounce e descarte de resposta obsoleta.
 *
 * As stories usam um `search` mockado com atraso artificial para exibir o estado
 * de carregamento e o "sem resultados". Digite para ver: o debounce evita buscar
 * a cada tecla e o loading aparece enquanto a promise não resolve.
 */
const cursos: SearchBarItem[] = [
  { value: "1", meta: "MIDS - 78", label: "Desenvolvimento de Sistema" },
  { value: "2", meta: "MELE - 32", label: "Eletrotécnica" },
  { value: "3", meta: "MMEC - 15", label: "Mecânica Industrial" },
  {
    value: "4",
    meta: "MADS - 91",
    label: "Análise e Desenvolvimento de Sistemas",
  },
  { value: "5", meta: "MAUT - 07", label: "Automação Industrial" },
];

function filtrar(query: string): SearchBarItem[] {
  const needle = query.trim().toLowerCase();
  return cursos.filter((c) =>
    `${c.meta} ${c.label}`.toLowerCase().includes(needle),
  );
}

/** Resolve depois de `delay` ms — simula latência do back. */
function delayed(
  result: SearchBarItem[],
  delay = 700,
): Promise<SearchBarItem[]> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}

const meta: Meta<typeof SearchBarAsync> = {
  title: "Componentes/Inputs/SearchBar/SearchBarAsync",
  component: SearchBarAsync,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBarAsync>;

/** Busca com ~700ms de latência: digite "des" e veja o loading antes dos resultados. O debounce (300ms) evita buscar a cada tecla. */
export const Assincrono: Story = {
  render: () => {
    const [chosen, setChosen] = useState("");
    return (
      <div>
        <SearchBarAsync
          placeholder="Buscar curso"
          aria-label="Buscar curso"
          search={(q) => delayed(filtrar(q))}
          onSelect={(item) => setChosen(item.label)}
        />
        {chosen ? (
          <p className="mt-4 text-body-sm text-text-secondary">
            Selecionado: <span className="text-text-primary">{chosen}</span>
          </p>
        ) : null}
      </div>
    );
  },
};

/** Sempre retorna vazio após a latência — exibe o estado "sem resultados". */
export const SemResultados: Story = {
  render: () => (
    <SearchBarAsync
      placeholder="Buscar (sem resultados)"
      aria-label="Buscar"
      search={() => delayed([])}
      onSelect={() => undefined}
    />
  ),
};

/**
 * `openOnFocus` — busca a lista inicial (`search("")`) na **primeira abertura**.
 * Foque e veja "Carregando…" antes da lista completa. Feche (Esc) e reabra: não
 * busca de novo, a lista inicial fica em cache.
 */
export const ListaInicialAsync: Story = {
  render: () => {
    const [chosen, setChosen] = useState("");
    return (
      <div>
        <SearchBarAsync
          openOnFocus
          placeholder="Buscar curso"
          aria-label="Buscar curso"
          search={(q) => delayed(filtrar(q))}
          onSelect={(item) => setChosen(item.label)}
        />
        {chosen ? (
          <p className="mt-4 text-body-sm text-text-secondary">
            Selecionado: <span className="text-text-primary">{chosen}</span>
          </p>
        ) : null}
      </div>
    );
  },
};

/**
 * **Corrida entre o prefetch e a digitação** — latência alta (1500ms) para dar
 * tempo de reproduzir na mão.
 *
 * Roteiro: foque, **digite rápido** enquanto o "Carregando…" ainda está na tela,
 * depois **apague tudo**. A lista inicial deve voltar — não "Nenhum resultado".
 *
 * É o caso que o descarte por sequência (last-write-wins) quebraria se a resposta
 * do prefetch não fosse cacheada fora da guarda: a resposta chega obsoleta, é
 * descartada da exibição, mas continua sendo a lista inicial válida. Como a lista
 * fica aberta, não haveria uma segunda abertura para se recuperar.
 */
export const ListaInicialComCorrida: Story = {
  render: () => (
    <SearchBarAsync
      openOnFocus
      placeholder="Foque, digite rápido, depois apague"
      aria-label="Buscar curso"
      search={(q) => delayed(filtrar(q), 1500)}
      onSelect={() => undefined}
    />
  ),
  // Reproduz a corrida sem depender da mão do usuário. No instante do `clear`, o
  // prefetch (1500ms) ainda não resolveu, então `loaded` é false e o caminho
  // exercitado é o da auto-cura. Com o cache DENTRO da guarda de sequência (a
  // cópia ingênua do SelectAsync), aqui apareceria "Nenhum resultado" e a lista
  // ficaria presa assim — não há segunda abertura para se recuperar.
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    await step("focar dispara o prefetch", async () => {
      await userEvent.click(input);
      await expect(await canvas.findByRole("listbox")).toBeVisible();
    });

    await step("digitar por cima antes do prefetch resolver", async () => {
      await userEvent.type(input, "des", { delay: 10 });
    });

    await step("apagar tudo ainda durante o voo", async () => {
      await userEvent.clear(input);
    });

    await step("a lista inicial volta (não 'Nenhum resultado')", async () => {
      await waitFor(
        async () => {
          await expect(canvas.getAllByRole("option")).toHaveLength(
            cursos.length,
          );
        },
        { timeout: 8000 },
      );
      await expect(canvas.queryByText(/Nenhum resultado/i)).not.toBeInTheDocument();
    });
  },
};

/**
 * `openOnFocus` + `minChars={3}`: abaixo do limiar, a lista inicial aparece em
 * vez de lista vazia. Digite 1–2 caracteres para ver — com lista inicial ligada,
 * o usuário nunca encara um menu vazio. A busca no back só dispara a partir do
 * 3º caractere.
 */
export const ListaInicialComMinChars: Story = {
  render: () => (
    <SearchBarAsync
      openOnFocus
      minChars={3}
      placeholder="Busca a partir de 3 caracteres"
      aria-label="Buscar curso"
      search={(q) => delayed(filtrar(q))}
      onSelect={() => undefined}
    />
  ),
};
