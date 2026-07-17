/**
 * Dashboard de Checklist — componentes de domínio.
 *
 * charts/  wrappers Chart.js (DS)
 * kpis/    cards de indicador
 * tables/  zona vermelha e listagens
 * alerts/  orientações
 * data/    mocks, inventário, fixtures
 */
export * from './alerts'
export * from './charts'
export * from './data'
export * from './kpis'
export * from './tables'
export {
  defaultDashboardPeriod,
  formatIsoDatePt,
  toLocalIsoDate,
  validateDashboardPeriod,
  type PeriodValidation,
} from './period'
