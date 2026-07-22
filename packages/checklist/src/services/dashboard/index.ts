/**
 * API client-side do dashboard (browser → BFF).
 *
 * Server-side (Route Handlers): importe de
 * `@portal/checklist/services/server/statsService` ou
 * `@portal/checklist/services/dashboard/server/statsService`.
 * Não reexporte server daqui — puxa `next/headers` e quebra o bundle client.
 */
export { fetchDashboardStats } from "./dashboardClient";
