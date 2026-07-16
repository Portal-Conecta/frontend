import { createHttpClient } from '@portal/core/http/httpClient'

import { checklistGatewayPath } from '../checklistGateway'
import type { DashboardStatsResponse, StatsEntry } from '../../types/stats'

const http = createHttpClient('API_GATEWAY_URL')

/** Stats granulares (GET path no serviço de checklist). */
export async function getStatsEntries(servicePath: string): Promise<StatsEntry[]> {
  return http.get<StatsEntry[]>(checklistGatewayPath(servicePath))
}

/**
 * Dashboard composto — GET /api/checklist-stats/dashboard
 * @param from ISO yyyy-MM-dd (opcional; backend default últimos 30 dias)
 * @param to ISO yyyy-MM-dd
 */
export async function getDashboardStats(
  from?: string,
  to?: string,
): Promise<DashboardStatsResponse> {
  return http.get<DashboardStatsResponse>(
    checklistGatewayPath('/api/checklist-stats/dashboard'),
    { params: { from, to } },
  )
}
