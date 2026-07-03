import type {
  AnnouncementResponse,
  ListAnnouncementsResponse,
  ListPostsParams,
} from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'

/**
 * Serviço de comunicados no server. Fala direto com o back de comunicados pelo
 * http client compartilhado, que lê o JWT do cookie de sessão — então só roda em
 * Server Components e Route Handlers, nunca no browser.
 *
 * Os caminhos mantêm o vocabulário `/api/posts` do back; a superfície TypeScript
 * usa o nome de domínio `Announcement`.
 */

const http = createHttpClient('COMUNICADOS_API_URL')

/** Lista o mural de comunicados (`GET /api/posts`), paginado. */
export async function listAnnouncements(
  params: ListPostsParams = {},
): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>('/api/posts', {
    params: params as QueryParams,
  })
}

/**
 * Lista os comunicados do próprio autor (`GET /api/posts/mine`) — mesma
 * paginação do mural, mas escopado ao usuário da sessão pelo back. Alimenta a
 * tela "Meus Comunicados" (#211).
 *
 * Recebe a query já como bag genérica (`QueryParams`) porque quem chama é o BFF,
 * repassando os filtros crus da URL. Os filtros suportados são os de
 * `ListPostsParams`.
 */
export async function listMyAnnouncements(
  params: QueryParams = {},
): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>('/api/posts/mine', { params })
}

/** Soft delete de um comunicado próprio (`DELETE /api/posts/{id}`); o back responde 204. */
export async function deleteAnnouncement(id: string): Promise<void> {
  await http.delete<void>(`/api/posts/${id}`)
}

/** Fixa um comunicado no mural (`PATCH /api/posts/{id}/pin`), retornando o estado atualizado. */
export async function pinAnnouncement(id: string): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(`/api/posts/${id}/pin`)
}

/** Desafixa um comunicado (`PATCH /api/posts/{id}/unpin`), retornando o estado atualizado. */
export async function unpinAnnouncement(id: string): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(`/api/posts/${id}/unpin`)
}
