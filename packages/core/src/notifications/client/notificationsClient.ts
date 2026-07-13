import { bffFetch } from '../../http/bffClient'
import type { UnreadCountResponse } from '../types'

/**
 * Contagem de não lidas via BFF (`GET /api/notifications/unread-count`).
 * `no-store`: a contagem muda quando o usuário lê notificações — nunca servir
 * um valor cacheado pelo browser, senão o dot do sino não some após a leitura.
 */
export function getUnreadCountClient(): Promise<UnreadCountResponse> {
  return bffFetch<UnreadCountResponse>('/api/notifications/unread-count', {
    cache: 'no-store',
  })
}
