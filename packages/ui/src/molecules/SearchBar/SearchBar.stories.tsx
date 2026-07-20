import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { SearchBar, type SearchBarItem } from "./SearchBar";

/**
 * SearchBar — campo de busca com lista rolável de resultados ricos.
 *
 * Título em `Componentes/Inputs/SearchBar/*` (grupo próprio da família, conforme
 * ADR-0011 adendo 2026-07-07) — base controlada aqui; `SearchBarAsync` (busca no
 * back com debounce) entra como irmão.
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
  {
    value: "5",
    meta: "MAUT - 07",
    label: "Automação Industrial",
    disabled: true,
  },
];

function filtrar(query: string): SearchBarItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return cursos.filter((c) =>
    `${c.meta} ${c.label}`.toLowerCase().includes(needle),
  );
}

const meta: Meta<typeof SearchBar> = {
  title: "Componentes/Inputs/SearchBar/SearchBar",
  component: SearchBar,
  parameters: { layout: "padded" },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Altura/tipografia do campo. Default `md`.",
    },
    clearOnSelect: {
      control: "boolean",
      description:
        "true limpa o campo ao escolher; false preenche com o label.",
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

// Base é controlada: o consumidor filtra os `items` a partir de `onQueryChange`.
const render: Story["render"] = (args) => {
  const [items, setItems] = useState<SearchBarItem[]>([]);
  const [chosen, setChosen] = useState("");
  return (
    <div>
      <SearchBar
        {...args}
        items={items}
        onQueryChange={(q) => setItems(filtrar(q))}
        onSelect={(item) => setChosen(item.label)}
      />
      {chosen ? (
        <p className="mt-4 text-body-sm text-text-secondary">
          Selecionado: <span className="text-text-primary">{chosen}</span>
        </p>
      ) : null}
    </div>
  );
};

/** Playground — digite (ex.: "des", "MELE") para ver os resultados; setas navegam, Enter escolhe, Esc fecha. Modo ação: o campo limpa ao escolher. */
export const Default: Story = {
  args: { placeholder: "Buscar curso", "aria-label": "Buscar curso" },
  render,
  // Guarda de regressão do `openOnFocus` (#435): sem a prop, a SearchBar tem de
  // continuar nascendo vazia e fechando ao apagar. É o contra-exemplo que prova
  // que a prop nova é opt-in de verdade.
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    await step("focar NÃO abre (sem openOnFocus)", async () => {
      await userEvent.click(input);
      await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
    });

    await step("digitar abre", async () => {
      await userEvent.type(input, "des");
      await expect(await canvas.findByRole("listbox")).toBeVisible();
    });

    await step("apagar fecha", async () => {
      await userEvent.clear(input);
      await waitFor(async () => {
        await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  },
};

/** `clearOnSelect: false` — ao escolher, o campo é preenchido com o label (espelha o Select). */
export const PreencheCampo: Story = {
  args: {
    placeholder: "Buscar curso",
    clearOnSelect: false,
    "aria-label": "Buscar curso",
  },
  render,
};

/** Resultado desabilitado (Automação Industrial) fica esmaecido, não clicável e é pulado pela navegação por teclado. */
export const ComItemDesabilitado: Story = {
  args: {
    placeholder: 'Buscar curso (tente "industrial")',
    "aria-label": "Buscar curso",
  },
  render,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => {
        function Row() {
          const [items, setItems] = useState<SearchBarItem[]>([]);
          return (
            <SearchBar
              size={size}
              placeholder={size}
              aria-label={size}
              items={items}
              onQueryChange={(q) => setItems(filtrar(q))}
              onSelect={() => undefined}
            />
          );
        }
        return <Row key={size} />;
      })}
    </div>
  ),
};

/**
 * Seleção persistente: ao escolher, o item fica *pressed* e fixado no topo da
 * lista (via `selectedItem` controlado), permanecendo lá em novas buscas. Escolha
 * um curso e depois busque outro — o escolhido segue no topo, destacado.
 */
export const SelecaoPersistente: Story = {
  render: () => {
    const [items, setItems] = useState<SearchBarItem[]>([]);
    const [selected, setSelected] = useState<SearchBarItem | null>(null);
    return (
      <div>
        <SearchBar
          placeholder="Buscar curso"
          aria-label="Buscar curso"
          items={items}
          selectedItem={selected}
          onQueryChange={(q) => setItems(filtrar(q))}
          onSelect={(item) => setSelected(item)}
        />
        {selected ? (
          <p className="mt-4 text-body-sm text-text-secondary">
            Fixado no topo (pressed):{" "}
            <span className="text-text-primary">{selected.label}</span>
          </p>
        ) : null}
      </div>
    );
  },
};

/**
 * Como `filtrar`, mas devolve **todos** os cursos quando a query está vazia — é o
 * que alimenta a lista inicial do `openOnFocus`.
 */
function filtrarComListaInicial(query: string): SearchBarItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return cursos;
  return cursos.filter((c) =>
    `${c.meta} ${c.label}`.toLowerCase().includes(needle),
  );
}

/**
 * `openOnFocus` — a lista abre **antes de digitar**, mostrando todos os cursos.
 * Três efeitos para conferir: foque (abre já com a lista cheia), digite (filtra)
 * e **apague tudo** (volta à lista cheia, em vez de fechar).
 *
 * A lista inicial é responsabilidade do consumidor: aqui o filtro devolve tudo
 * quando a query está vazia.
 */
export const ListaInicial: Story = {
  render: () => {
    const [items, setItems] = useState<SearchBarItem[]>(cursos);
    const [chosen, setChosen] = useState("");
    return (
      <div>
        <SearchBar
          openOnFocus
          placeholder="Buscar curso"
          aria-label="Buscar curso"
          items={items}
          onQueryChange={(q) => setItems(filtrarComListaInicial(q))}
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    await step("focar abre a lista já com todos os cursos", async () => {
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      await expect(listbox).toBeVisible();
      await expect(canvas.getAllByRole("option")).toHaveLength(cursos.length);
    });

    await step("digitar filtra", async () => {
      await userEvent.type(input, "des");
      await waitFor(async () => {
        const encontrados = canvas.getAllByRole("option");
        await expect(encontrados.length).toBeGreaterThan(0);
        await expect(encontrados.length).toBeLessThan(cursos.length);
      });
    });

    await step("apagar volta à lista cheia (não fecha)", async () => {
      await userEvent.clear(input);
      await waitFor(async () => {
        await expect(canvas.getByRole("listbox")).toBeVisible();
        await expect(canvas.getAllByRole("option")).toHaveLength(cursos.length);
      });
    });
  },
};

/**
 * Lista inicial + seleção persistente — o cenário do `RoomFilterBar` (mapa de
 * salas). Ao focar, a lista completa aparece; o item escolhido fica fixado no
 * topo como *pressed*, sem duplicar na lista abaixo.
 */
export const ListaInicialComSelecao: Story = {
  render: () => {
    const [items, setItems] = useState<SearchBarItem[]>(cursos);
    const [selected, setSelected] = useState<SearchBarItem | null>(null);
    return (
      <div>
        <SearchBar
          openOnFocus
          clearOnSelect={false}
          placeholder="Buscar curso"
          aria-label="Buscar curso"
          items={items}
          selectedItem={selected}
          onQueryChange={(q) => setItems(filtrarComListaInicial(q))}
          onSelect={(item) => setSelected(item)}
        />
        {selected ? (
          <p className="mt-4 text-body-sm text-text-secondary">
            Fixado no topo (pressed):{" "}
            <span className="text-text-primary">{selected.label}</span>
          </p>
        ) : null}
      </div>
    );
  },
};

const muitasSalas: SearchBarItem[] = Array.from({ length: 25 }, (_, i) => ({
  value: `s${i}`,
  meta: `SALA - ${101 + i}`,
  label: `Laboratório ${i + 1}`,
}));

/** Lista longa (25 resultados): digite "sala" para ver a **rolagem** — a lista limita a altura e rola; as setas mantêm o item ativo em vista. */
export const MuitosResultados: Story = {
  render: () => {
    const [items, setItems] = useState<SearchBarItem[]>([]);
    return (
      <SearchBar
        placeholder='Digite "sala" para ver a rolagem'
        aria-label="Buscar sala"
        items={items}
        onQueryChange={(q) => {
          const needle = q.trim().toLowerCase();
          setItems(
            needle
              ? muitasSalas.filter((s) =>
                  `${s.meta} ${s.label}`.toLowerCase().includes(needle),
                )
              : [],
          );
        }}
        onSelect={() => undefined}
      />
    );
  },
};
