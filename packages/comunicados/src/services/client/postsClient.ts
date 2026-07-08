import type { AnnouncementResponse, ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

/**
 * Serviço de posts no browser. Toda chamada vai ao BFF de mesma origem
 * (`/api/comunicados/posts/*`); o JWT nunca sai do server.
 */

/** Lista o mural via BFF (`GET /api/comunicados/posts`). */
export async function listPostsClient(
  params: ListPostsParams = {},
): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts${buildQuery(params as QueryParams)}`,
  )
}

/** Lista os posts do próprio autor via BFF (`GET /api/comunicados/posts/mine`). */
export async function listMyPostsClient(
  params: ListPostsParams = {},
): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts/mine${buildQuery(params as QueryParams)}`,
  )
}

/** Exclui um post próprio via BFF (`DELETE /api/comunicados/posts/{id}`). */
export async function deletePostClient(id: string): Promise<void> {
  return bffFetch<void>(`/api/comunicados/posts/${id}`, { method: 'DELETE' })
}

/** Fixa um post via BFF (`PATCH /api/comunicados/posts/{id}/pin`). */
export async function pinPostClient(
  id: string,
  pinnedOrder?: number,
): Promise<AnnouncementResponse> {
  return bffFetch<AnnouncementResponse>(`/api/comunicados/posts/${id}/pin`, {
    method: 'PATCH',
    body: JSON.stringify({ pinnedOrder }),
  })
}

/** Desafixa um post via BFF (`PATCH /api/comunicados/posts/{id}/unpin`). */
export async function unpinPostClient(id: string): Promise<AnnouncementResponse> {
  return bffFetch<AnnouncementResponse>(`/api/comunicados/posts/${id}/unpin`, {
    method: 'PATCH',
  })
}
