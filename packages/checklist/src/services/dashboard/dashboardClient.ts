import { bffFetch } from '@portal/core/http/bffClient'

import type { DashboardStatsResponse } from '../../types/dashboard'

/**
 * Cliente browser → BFF Next (`/api/checklist/stats/dashboard`).
 */
export async function fetchDashboardStats(params?: {
  from?: string
  to?: string
}): Promise<DashboardStatsResponse> {
  const qs = new URLSearchParams()
  if (params?.from) qs.set('from', params.from)
  if (params?.to) qs.set('to', params.to)
  const query = qs.toString()
  const path = query
    ? `/api/checklist/stats/dashboard?${query}`
    : '/api/checklist/stats/dashboard'
  return bffFetch<DashboardStatsResponse>(path)
}
