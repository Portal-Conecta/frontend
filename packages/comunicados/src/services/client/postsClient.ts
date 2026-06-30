import type { ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { buildQuery, type QueryParams } from '../query'
import { bffFetch } from './bffClient'

/** Lista posts via BFF (`GET /api/comunicados/posts`) — uso no browser. */
export async function listPostsClient(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts${buildQuery(params as QueryParams)}`,
  )
}
