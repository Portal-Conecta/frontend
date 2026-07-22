/**
 * Dashboard de Checklist — componentes de domínio.
 *
 * charts/  wrappers Chart.js (DS)
 * kpis/    cards de indicador
 * data/    mocks, inventário, fixtures
 */
export * from "./charts";
export * from "./data";
export * from "./kpis";
export {
  defaultDashboardPeriod,
  formatIsoDatePt,
  toLocalIsoDate,
  validateDashboardPeriod,
  type PeriodValidation,
} from "./period";
