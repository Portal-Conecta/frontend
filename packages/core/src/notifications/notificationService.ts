/**
 * notificationService — notificações contra o back-end, via API Gateway.
 *
 * Lógica pura: sem React, sem `next/headers`. Roda no server (Server Components e
 * Route Handlers). Usa o http client compartilhado, que resolve base URL, Bearer,
 * `no-store`, 204 e a taxonomia de erro (`HttpError`).
 */

import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type {
  GetNotificationsParams,
  MarkAsReadRequest,
  PagedNotificationsResponse,
  UnreadCountResponse,
} from './types'

const http = createHttpClient('API_GATEWAY_URL')

export const DEFAULT_PAGE_SIZE = 20

/** Teto de ids por lote no PATCH — alinhado ao maior `size` que a tela pede. */
export const MAX_READ_BATCH = 100

/** Lista notificações do usuário da sessão, paginadas e filtradas por status. */
export function getNotifications(
  accessToken: string,
  params: GetNotificationsParams,
): Promise<PagedNotificationsResponse> {
  return http.get<PagedNotificationsResponse>(hubGatewayPath('/notifications'), {
    token: accessToken,
    params: {
      status: params.status,
      page: params.page ?? 0,
      size: params.size ?? DEFAULT_PAGE_SIZE,
    },
  })
}

/**
 * Marca notificações como lidas em lote, pelo `notificationId` (não pelo `id` da
 * entrega). O back resolve o destinatário pelo `Authorization`, então o escopo da
 * leitura é sempre o usuário da sessão.
 */
export function markNotificationsAsRead(
  accessToken: string,
  notificationIds: string[],
): Promise<void> {
  const body: MarkAsReadRequest = { notificationIds }

  return http.patch<void>(hubGatewayPath('/notifications/read'), {
    token: accessToken,
    body,
  })
}

/** Conta notificações não lidas do usuário da sessão — alimenta o dot do sino no header. */
export function getUnreadNotificationsCount(accessToken: string): Promise<UnreadCountResponse> {
  return http.get<UnreadCountResponse>(hubGatewayPath('/notifications/unread-count'), {
    token: accessToken,
  })
}
