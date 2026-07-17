import { createHttpClient } from '@portal/core/http/httpClient'

import { checklistGatewayPath } from '../../checklistGateway'
import type { DashboardStatsResponse, StatsEntry } from '../../../types/dashboard'

const http = createHttpClient('API_GATEWAY_URL')

/** Stats granulares (GET path no serviço de checklist). */
export async function getStatsEntries(servicePath: string): Promise<StatsEntry[]> {
  return http.get<StatsEntry[]>(checklistGatewayPath(servicePath))
}

/**
 * Dashboard composto — GET /api/checklist-stats/dashboard
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
