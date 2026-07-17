/**
 * Inventário dos gráficos do dashboard de Checklist
 * (payload único GET /api/checklist/stats/dashboard).
 *
 * kind: tipo Chart.js | dataShape: labels + valores (StatsEntry[]).
 */
import type { DashboardStats } from '../../../types/dashboard'

export type DashboardChartKind = 'line' | 'bar' | 'doughnut' | 'kpi'

export interface DashboardChartSpec {
  id: keyof Omit<DashboardStats, 'periodo'>
  title: string
  kind: DashboardChartKind
  /** Série única temporal ou categórica. */
  dataShape: 'time-series' | 'categorical' | 'ratio'
  notes?: string
}

export const DASHBOARD_CHART_INVENTORY: readonly DashboardChartSpec[] = [
  {
    id: 'execucoesPorDia',
    title: 'Execuções por dia',
    kind: 'line',
    dataShape: 'time-series',
    notes: 'Uma série temporal; eixo Y único (contagem).',
  },
  {
    id: 'execucoesPorStatus',
    title: 'Execuções por status',
    kind: 'doughnut',
    dataShape: 'categorical',
    notes: 'Cor por status (DRAFT/SUBMITTED/CANCELED), não por rank.',
  },
  {
    id: 'taxaConclusao',
    title: 'Taxa de conclusão',
    kind: 'doughnut',
    dataShape: 'ratio',
    notes: 'Submetidas vs total — KPI em donut; sem dual-axis.',
  },
  {
    id: 'issuesPorStatus',
    title: 'Pendências por status',
    kind: 'bar',
    dataShape: 'categorical',
  },
  {
    id: 'issuesPorPrioridade',
    title: 'Pendências por prioridade',
    kind: 'bar',
    dataShape: 'categorical',
    notes: 'Prioridade usa rampa categórica; status de feedback não vira série.',
  },
  {
    id: 'issuesPorDia',
    title: 'Pendências por dia',
    kind: 'line',
    dataShape: 'time-series',
  },
] as const
