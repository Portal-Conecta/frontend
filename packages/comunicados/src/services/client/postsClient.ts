import type { ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { bffFetch } from './bffClient'

function buildQuery(params: ListPostsParams): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params) as Array<[keyof ListPostsParams, unknown]>) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== '') search.append(String(key), String(item))
      }
      continue
    }
    search.set(String(key), String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

/** Lista posts via BFF (`GET /api/comunicados/posts`) — uso no browser. */
export async function listPostsClient(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(`/api/comunicados/posts${buildQuery(params)}`)
}
