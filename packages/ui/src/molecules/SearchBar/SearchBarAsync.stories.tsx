import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

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
