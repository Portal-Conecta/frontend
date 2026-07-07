import type { AnnouncementResponse, ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

/**
 * Serviço de comunicados no browser. Toda chamada vai ao BFF de mesma origem
 * (`/api/comunicados/posts/*`); o JWT nunca sai do server. Consumido pelos hooks
 * e componentes client. Os caminhos mantêm o vocabulário `posts` do back.
 */

/** Lista o mural de comunicados via BFF (`GET /api/comunicados/posts`). */
export async function listAnnouncementsClient(
  params: ListPostsParams = {},
): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts${buildQuery(params as QueryParams)}`,
  )
}

/** Lista os comunicados do próprio autor via BFF (`GET /api/comunicados/posts/mine`). */
export async function listMyAnnouncementsClient(
  params: ListPostsParams = {},
): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts/mine${buildQuery(params as QueryParams)}`,
  )
}

/** Exclui um comunicado próprio via BFF (`DELETE /api/comunicados/posts/{id}`). */
export async function deleteAnnouncementClient(id: string): Promise<void> {
  return bffFetch<void>(`/api/comunicados/posts/${id}`, { method: 'DELETE' })
}

/** Fixa um comunicado via BFF (`PATCH /api/comunicados/posts/{id}/pin`). */
export async function pinAnnouncementClient(
  id: string,
  pinnedOrder?: number,
): Promise<AnnouncementResponse> {
  return bffFetch<AnnouncementResponse>(`/api/comunicados/posts/${id}/pin`, {
    method: 'PATCH',
    body: JSON.stringify({ pinnedOrder }),
  })
}

/** Desafixa um comunicado via BFF (`PATCH /api/comunicados/posts/{id}/unpin`). */
export async function unpinAnnouncementClient(id: string): Promise<AnnouncementResponse> {
  return bffFetch<AnnouncementResponse>(`/api/comunicados/posts/${id}/unpin`, { method: 'PATCH' })
}

/** Reagenda um comunicado via BFF (`PATCH /api/comunicados/posts/{id}/schedule`). */
export async function rescheduleAnnouncementClient(
  id: string,
  scheduledFor: string,
): Promise<AnnouncementResponse> {
  return bffFetch<AnnouncementResponse>(`/api/comunicados/posts/${id}/schedule`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduledFor }),
  })
}