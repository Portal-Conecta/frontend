import type { AnnouncementDetail, AnnouncementUpdatePayload, ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

/** Lista posts via BFF (`GET /api/comunicados/posts`) — uso no browser. */
export async function listPostsClient(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts${buildQuery(params as QueryParams)}`,
  )
}

/** Carrega o detalhe de um comunicado via BFF (`GET /api/comunicados/posts/:id`). */
export async function loadAnnouncementClient(id: string): Promise<AnnouncementDetail> {
  return bffFetch<AnnouncementDetail>(`/api/comunicados/posts/${id}`)
}

/** Atualiza um comunicado via BFF (`PUT /api/comunicados/posts/:id`). */
export async function updateAnnouncementClient(
  id: string,
  payload: AnnouncementUpdatePayload,
): Promise<AnnouncementDetail> {
  const { destinations: _destinations, ...body } = payload

  return bffFetch<AnnouncementDetail>(`/api/comunicados/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/** Reagenda um comunicado via BFF (`PATCH /api/comunicados/posts/:id/schedule`). */
export async function rescheduleAnnouncementClient(
  id: string,
  scheduledFor: string,
): Promise<AnnouncementDetail> {
  return bffFetch<AnnouncementDetail>(`/api/comunicados/posts/${id}/schedule`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduledFor }),
  })
}
