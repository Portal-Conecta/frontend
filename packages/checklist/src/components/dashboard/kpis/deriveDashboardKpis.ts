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
  const highPriority = findStatsValue(stats.issuesPorPrioridade, [
    "HIGH",
    "ALTA",
    "CRIT",
  ]);

  const taxaHint =
    taxa.total > 0
      ? `${taxa.submitted.toLocaleString("pt-BR")} de ${taxa.total.toLocaleString("pt-BR")} submetidas`
      : "Execuções concluídas no recorte";

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
    {
      id: "prioridade-alta",
      label: "Prioridade alta",
      value: highPriority.toLocaleString("pt-BR"),
      hint: "Prioridade alta no recorte",
      icon: "triangle-alert",
      tone: "negative",
    },
  ];
}
