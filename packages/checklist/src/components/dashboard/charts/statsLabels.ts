/**
 * Rótulos amigáveis para enums/labels crus do backend nos gráficos.
 * Chave normalizada: upper, sem `_` / `-` / espaço.
 */
const LABEL_PT: Record<string, string> = {
  // execuções
  SUBMITTED: "Submetidas",
  SUBMIT: "Submetidas",
  DRAFT: "Rascunho",
  CANCELED: "Canceladas",
  CANCELLED: "Canceladas",
  // issues status
  OPEN: "Abertas",
  INPROGRESS: "Em andamento",
  RESOLVED: "Resolvidas",
  CLOSED: "Fechadas",
  // prioridade
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
  CRITICAL: "Crítica",
  // taxa (quando vier cru)
  SUBMITTEDCOUNT: "Submetidas",
  TOTAL: "Total",
  RATEPERCENT: "Taxa %",
};

function normalizeKey(label: string): string {
  return label.toUpperCase().replace(/[_\s-]/g, "");
}

/** Traduz label do backend para exibição; desconhecidos passam como vieram. */
export function humanizeStatsLabel(label: string): string {
  const key = normalizeKey(label);
  return LABEL_PT[key] ?? label;
}

export function humanizeStatsEntries<
  T extends { label: string; value: number },
>(entries: T[]): T[] {
  return entries.map((e) => ({ ...e, label: humanizeStatsLabel(e.label) }));
}
