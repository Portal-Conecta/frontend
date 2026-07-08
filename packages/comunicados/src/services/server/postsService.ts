import type {
  AnnouncementResponse,
  ListAnnouncementsResponse,
  ListPostsParams,
} from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'

const http = createHttpClient('API_GATEWAY_URL')

/**
 * Serviço de posts no server. Fala direto com o back de comunicados pelo http
 * client compartilhado, que lê o JWT do cookie de sessão — então só roda em Server
 * Components e Route Handlers, nunca no browser.
 */

/** Lista o mural de comunicados (`GET /api/posts`), paginado. */
export async function listPosts(
  params: ListPostsParams = {},
): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>('/api/posts', {
    params: params as QueryParams,
  })
}

/**
 * Lista os posts do próprio autor via `GET /api/posts?mine=true` — mesma paginação
 * do mural, mas escopado ao usuário da sessão pelo back. Inclui agendados (SCHEDULED)
 * e exige permissão de criação (o back responde 403 caso contrário).
 */
export async function listMyPosts(
  params: QueryParams = {},
): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>('/api/posts', {
    params: { ...params, mine: true },
  })
}

/** Soft delete de um post próprio (`DELETE /api/posts/{id}`); o back responde 204. */
export async function deletePost(id: string): Promise<void> {
  await http.delete<void>(`/api/posts/${id}`)
}

/**
 * Fixa um post no mural (`PATCH /api/posts/{id}/pin`), retornando o estado
 * atualizado. O back aceita `pinnedOrder` (inteiro positivo) opcional no body.
 */
export async function pinPost(
  id: string,
  pinnedOrder?: number,
): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(`/api/posts/${id}/pin`, { body: { pinnedOrder } })
}

/** Desafixa um post (`PATCH /api/posts/{id}/unpin`), retornando o estado atualizado. */
export async function unpinPost(id: string): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(`/api/posts/${id}/unpin`)
}
