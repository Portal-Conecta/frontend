import { bffFetch } from '../../http/bffClient'
import type { UnreadCountResponse } from '../types'

/** Contagem de não lidas via BFF (`GET /api/notifications/unread-count`). */
export function getUnreadCountClient(): Promise<UnreadCountResponse> {
  return bffFetch<UnreadCountResponse>('/api/notifications/unread-count')
}
