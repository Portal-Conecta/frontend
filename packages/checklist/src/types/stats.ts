/** Formato genérico "categoria → valor", usado por quase todos os endpoints de stats. */
export interface StatsEntry {
  /** Rótulo da categoria (ex.: "SUBMITTED", "2026-06-01" quando é série temporal). */
  label: string
  /** Contagem, média ou percentual — pode vir com casas decimais. */
  value: number
}

export interface StatsPeriodo {
  /** ISO "yyyy-MM-dd" */
  from: string
  /** ISO "yyyy-MM-dd" */
  to: string
}

/** Resposta do /dashboard — junta todos os gráficos fixos numa payload só. */
export interface DashboardStatsResponse {
  periodo: StatsPeriodo
  execucoesPorDia: StatsEntry[]
  execucoesPorStatus: StatsEntry[]
  taxaConclusao: StatsEntry[]
  issuesPorStatus: StatsEntry[]
  issuesPorPrioridade: StatsEntry[]
  issuesPorDia: StatsEntry[]
}