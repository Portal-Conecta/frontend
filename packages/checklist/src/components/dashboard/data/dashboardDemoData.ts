import type { StatsEntry } from "../../../types/dashboard";

/** KPIs do topo — valores da referência de produto. */
export const DASHBOARD_KPIS = [
  {
    id: "conformidade",
    label: "Conformidade",
    value: "94,2%",
    hint: "Média geral dos checklists",
    icon: "circle-check" as const,
    tone: "positive" as const,
  },
  {
    id: "cumprimento",
    label: "Cumprimento",
    value: "78,5%",
    hint: "Checklists enviados no prazo",
    icon: "clipboard-list" as const,
    tone: "brand" as const,
  },
  {
    id: "aderencia",
    label: "Aderência",
    value: "88,9%",
    hint: "Itens respondidos vs. esperados",
    icon: "clipboard-list" as const,
    tone: "brand" as const,
  },
  {
    id: "falhas",
    label: "Falhas Críticas",
    value: "4,3%",
    hint: "Não conformidades graves",
    icon: "triangle-alert" as const,
    tone: "negative" as const,
  },
] as const;

/** Falhas por categoria. */
export const FALHAS_POR_CATEGORIA: StatsEntry[] = [
  { label: "Tecnologia", value: 18 },
  { label: "Montagem", value: 12 },
  { label: "Organização", value: 7 },
];
