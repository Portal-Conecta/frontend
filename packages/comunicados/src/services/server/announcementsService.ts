import type {
  AnnouncementResponse,
  ListAnnouncementsResponse,
  ListPostsParams,
} from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'

import { comunicadosGatewayPath } from '../comunicadosGateway'

/**
 * Serviço de comunicados no server. Fala com o API Gateway
 * (`/comunicados/api/posts/*`) pelo http client compartilhado, que lê o JWT do
 * cookie de sessão — então só roda em Server Components e Route Handlers,
 * nunca no browser.
 *
 * Os caminhos mantêm o vocabulário `/api/posts` do serviço de comunicados; a
 * superfície TypeScript usa o nome de domínio `Announcement`.
 */

const http = createHttpClient('API_GATEWAY_URL')

/** Lista o mural de comunicados (`GET /api/posts`), paginado. */
export async function listAnnouncements(
  params: ListPostsParams = {},
): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>(comunicadosGatewayPath('/api/posts'), {
    params: params as QueryParams,
  })
}

/**
 * Lista os comunicados do próprio autor via o filtro `GET /api/posts?mine=true` —
 * mesma paginação do mural, mas escopado ao usuário da sessão pelo back. Esse
 * filtro também inclui os agendados (SCHEDULED) e exige permissão de criação (o
 * back responde 403 caso contrário). Alimenta a tela "Meus Comunicados" (#211).
 *
 * Recebe a query já como bag genérica (`QueryParams`) porque quem chama é o BFF,
 * repassando os filtros crus da URL. Os filtros suportados são os de
 * `ListPostsParams`; `mine=true` é forçado aqui, não vem do cliente.
 */
export async function listMyAnnouncements(
  params: QueryParams = {},
): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>(comunicadosGatewayPath('/api/posts'), {
    params: { ...params, mine: true },
  })
}

/** Soft delete de um comunicado próprio (`DELETE /api/posts/{id}`); o back responde 204. */
export async function deleteAnnouncement(id: string): Promise<void> {
  await http.delete<void>(comunicadosGatewayPath(`/api/posts/${id}`))
}

/**
 * Fixa um comunicado no mural (`PATCH /api/posts/{id}/pin`), retornando o estado
 * atualizado. O back aceita `pinnedOrder` (inteiro positivo) opcional no body —
 * omitido, ele resolve a ordem.
 */
export async function pinAnnouncement(
  id: string,
  pinnedOrder?: number,
): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(comunicadosGatewayPath(`/api/posts/${id}/pin`), {
    body: { pinnedOrder },
  })
}

/** Desafixa um comunicado (`PATCH /api/posts/{id}/unpin`), retornando o estado atualizado. */
export async function unpinAnnouncement(id: string): Promise<AnnouncementResponse> {
  return http.patch<AnnouncementResponse>(comunicadosGatewayPath(`/api/posts/${id}/unpin`))
}
