import type { DashboardStats } from '../../types/dashboard'

/** Dados de demonstração para Storybook e preview sem backend. */
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  periodo: { from: '2026-06-01', to: '2026-06-30' },
  execucoesPorDia: [
    { label: '01/06', value: 4 },
    { label: '02/06', value: 6 },
    { label: '03/06', value: 3 },
    { label: '04/06', value: 8 },
    { label: '05/06', value: 5 },
    { label: '06/06', value: 9 },
    { label: '07/06', value: 7 },
  ],
  execucoesPorStatus: [
    { label: 'SUBMITTED', value: 42 },
    { label: 'DRAFT', value: 12 },
    { label: 'CANCELED', value: 5 },
  ],
  taxaConclusao: [
    { label: 'Concluídas', value: 78 },
    { label: 'Pendentes', value: 22 },
  ],
  issuesPorStatus: [
    { label: 'OPEN', value: 15 },
    { label: 'IN_PROGRESS', value: 8 },
    { label: 'RESOLVED', value: 21 },
    { label: 'CANCELED', value: 3 },
  ],
  issuesPorPrioridade: [
    { label: 'HIGH', value: 9 },
    { label: 'MEDIUM', value: 18 },
    { label: 'LOW', value: 14 },
  ],
  issuesPorDia: [
    { label: '01/06', value: 2 },
    { label: '02/06', value: 4 },
    { label: '03/06', value: 1 },
    { label: '04/06', value: 5 },
    { label: '05/06', value: 3 },
    { label: '06/06', value: 6 },
    { label: '07/06', value: 2 },
  ],
}
