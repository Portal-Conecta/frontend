import type {
  AnnouncementDetail,
  AnnouncementResponse,
  AnnouncementUpdatePayload,
  ListAnnouncementsResponse,
  ListPostsParams,
} from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'
import { comunicadosGatewayPath } from '../comunicadosGateway'

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
  return http.get<ListAnnouncementsResponse>(comunicadosGatewayPath('/api/posts'), {
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
  return http.get<ListAnnouncementsResponse>(comunicadosGatewayPath('/api/posts'), {
    params: { ...params, mine: true },
  })
}

/** Carrega o detalhe de um comunicado (`GET /api/posts/{id}`). */
export async function getAnnouncement(id: string): Promise<AnnouncementDetail> {
  return http.get<AnnouncementDetail>(comunicadosGatewayPath(`/api/posts/${id}`))
}

/** Atualiza um comunicado (`PUT /api/posts/{id}`). */
export async function updateAnnouncement(
  id: string,
  payload: AnnouncementUpdatePayload,
): Promise<AnnouncementDetail> {
  return http.put<AnnouncementDetail>(comunicadosGatewayPath(`/api/posts/${id}`), {
    body: payload,
  })
}

/** Reagenda um comunicado agendado (`PATCH /api/posts/{id}/schedule`). */
export async function rescheduleAnnouncement(
  id: string,
  scheduledFor: string,
): Promise<AnnouncementDetail> {
  return http.patch<AnnouncementDetail>(comunicadosGatewayPath(`/api/posts/${id}/schedule`), {
    body: { scheduledFor },
  })
}

/** Soft delete de um post próprio (`DELETE /api/posts/{id}`); o back responde 204. */
export async function deletePost(id: string): Promise<void> {
  await http.delete<void>(comunicadosGatewayPath(`/api/posts/${id}`))
}

/**
 * Fixa um post no mural (`PATCH /api/posts/{id}/pin`), retornando o estado
 * atualizado. O back aceita `pinnedOrder` (inteiro positivo) opcional no body.
 */
export async function pinPost(
  id: string,
  pinnedOrder?: number,
): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(comunicadosGatewayPath(`/api/posts/${id}/pin`), {
    body: { pinnedOrder },
  })
}

/** Desafixa um post (`PATCH /api/posts/{id}/unpin`), retornando o estado atualizado. */
export async function unpinPost(id: string): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(comunicadosGatewayPath(`/api/posts/${id}/unpin`))
}
