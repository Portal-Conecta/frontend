import type { ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

/** Lista posts via BFF (`GET /api/comunicados/posts`) — uso no browser. */
export async function listPostsClient(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts${buildQuery(params as QueryParams)}`,
  )
}
