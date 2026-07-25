import type { IconName } from "@portal/ui";

import type { DashboardStats, StatsEntry } from "../../../types/dashboard";
import { findStatsValue, parseTaxaConclusao } from "../charts/taxaConclusao";

export interface DashboardKpiItem {
  id: string;
  label: string;
  value: string;
  hint: string;
  icon: IconName;
  tone: "positive" | "brand" | "negative";
}

function sum(entries: StatsEntry[]): number {
  return entries.reduce((acc, e) => acc + e.value, 0);
}

function formatPct(pct: number): string {
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;
}

/**
 * KPI da última semana de `tendenciaConformidade` (já usada no gráfico de
 * tendência) + variação vs a semana anterior — sem precisar de campo novo do
 * backend. Some da lista se a série vier vazia (dashboard recém-criado, sem
 * histórico semanal ainda).
 */
function complianceTrendKpi(entries: StatsEntry[]): DashboardKpiItem | null {
  if (entries.length === 0) return null;

  const latest = entries[entries.length - 1]!;
  const previous = entries.length > 1 ? entries[entries.length - 2]! : null;
  const delta = previous ? Math.round((latest.value - previous.value) * 10) / 10 : null;

  const hint =
    delta === null
      ? "Sem semana anterior para comparar"
      : delta === 0
        ? "Igual à semana anterior"
        : `${delta > 0 ? "+" : ""}${delta.toLocaleString("pt-BR")} pts vs semana anterior`;

  return {
    id: "conformidade-atual",
    label: "Conformidade (última semana)",
    value: formatPct(latest.value),
    hint,
    icon: "circle-check",
    tone: delta !== null && delta < 0 ? "negative" : "positive",
  };
}

/**
 * KPIs derivados do payload composto GET /api/checklist-stats/dashboard.
 *
 * `taxaConclusao` no backend real:
 *   [{ label: "submitted" }, { label: "total" }, { label: "ratePercent" }]
 */
export function deriveDashboardKpis(stats: DashboardStats): DashboardKpiItem[] {
  const taxa = parseTaxaConclusao(stats.taxaConclusao);

  const totalExec = sum(stats.execucoesPorStatus) || taxa.total || 0;
  const submitted =
    findStatsValue(stats.execucoesPorStatus, ["SUBMIT"]) || taxa.submitted;
  const totalIssues = sum(stats.issuesPorStatus);
  const openIssues =
    findStatsValue(stats.issuesPorStatus, ["OPEN"]) +
    findStatsValue(stats.issuesPorStatus, ["IN_PROGRESS", "PROGRESS", "ANDAM"]);

  const taxaHint =
    taxa.total > 0
      ? `${taxa.submitted.toLocaleString("pt-BR")} de ${taxa.total.toLocaleString("pt-BR")} submetidas`
      : "Execuções concluídas no recorte";

  const trendKpi = complianceTrendKpi(stats.tendenciaConformidade);

  return [
    {
      id: "taxa-conclusao",
      label: "Taxa de conclusão",
      value: formatPct(taxa.ratePercent),
      hint: taxaHint,
      icon: "circle-check",
      tone: "positive",
    },
    {
      id: "execucoes",
      label: "Execuções",
      value: totalExec.toLocaleString("pt-BR"),
      hint:
        submitted > 0
          ? `${submitted.toLocaleString("pt-BR")} submetidas`
          : "Total por status no período",
      icon: "clipboard-list",
      tone: "brand",
    },
    {
      id: "pendencias",
      label: "Pendências",
      value: totalIssues.toLocaleString("pt-BR"),
      hint:
        openIssues > 0
          ? `${openIssues.toLocaleString("pt-BR")} abertas / em andamento`
          : "Issues no recorte",
      icon: "clipboard-list",
      tone: "brand",
    },
    ...(trendKpi ? [trendKpi] : []),
  ];
}
