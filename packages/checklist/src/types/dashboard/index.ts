/** Formato genérico "categoria → valor" dos endpoints de stats do backend. */
export interface StatsEntry {
  label: string;
  value: number;
}

export interface StatsPeriodo {
  /** ISO yyyy-MM-dd */
  from: string;
  /** ISO yyyy-MM-dd */
  to: string;
}

/** Resposta do GET /api/checklist-stats/dashboard. */
export interface DashboardStatsResponse {
  periodo: StatsPeriodo;
  execucoesPorDia: StatsEntry[];
  execucoesPorStatus: StatsEntry[];
  taxaConclusao: StatsEntry[];
  issuesPorStatus: StatsEntry[];
  issuesPorPrioridade: StatsEntry[];
  issuesPorDia: StatsEntry[];
  /** Execuções submetidas por turno e faixa de compliance (label = `SHIFT|ok|atencao|critico`). */
  performancePorTurno: StatsEntry[];
  /** Média de compliance por semana no período (label = data ISO de início da semana). */
  tendenciaConformidade: StatsEntry[];
}

/** Alias usado pelos componentes de gráfico. */
export type DashboardStats = DashboardStatsResponse;
