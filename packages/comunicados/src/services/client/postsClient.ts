import type {
  AnnouncementDetail,
  AnnouncementFile,
  AnnouncementResponse,
  AnnouncementTag,
  AnnouncementUpdatePayload,
  ListAnnouncementsResponse,
  ListPostsParams,
} from '../../types'

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

/** Carrega o detalhe de um comunicado via BFF (`GET /api/comunicados/posts/:id`). */
export async function loadAnnouncementClient(id: string): Promise<AnnouncementDetail> {
  return bffFetch<AnnouncementDetail>(`/api/comunicados/posts/${id}`)
}

/** Atualiza um comunicado via BFF (`PUT /api/comunicados/posts/:id`).
 * O back devolve `AnnouncementResponse` (não o detalhe completo).
 */
export async function updateAnnouncementClient(
  id: string,
  payload: AnnouncementUpdatePayload,
): Promise<AnnouncementResponse> {
  return bffFetch<AnnouncementResponse>(`/api/comunicados/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/** Reagenda um comunicado via BFF (`PATCH /api/comunicados/posts/:id/schedule`). */
export async function rescheduleAnnouncementClient(
  id: string,
  scheduledFor: string,
): Promise<AnnouncementResponse> {
  return bffFetch<AnnouncementResponse>(`/api/comunicados/posts/${id}/schedule`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduledFor }),
  })
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

/** Lista as tags via BFF (`GET /api/comunicados/posts/{id}/tags`). */
export async function getPostTagsClient(id: string): Promise<AnnouncementTag[]> {
  return bffFetch<AnnouncementTag[]>(`/api/comunicados/posts/${id}/tags`)
}

/** Lista as imagens via BFF (`GET /api/comunicados/posts/{id}/images`). */
export async function getPostImagesClient(id: string): Promise<AnnouncementFile[]> {
  return bffFetch<AnnouncementFile[]>(`/api/comunicados/posts/${id}/images`)
}
