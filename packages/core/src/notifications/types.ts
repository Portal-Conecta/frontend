export type NotificationStatus = 'READ' | 'UNREAD'

export type NotificationType = 'CHECKLIST' | 'MAPA' | 'COMUNICADO' | 'OUTRO'

export function isNotificationStatus(value: unknown): value is NotificationStatus {
  return value === 'READ' || value === 'UNREAD'
}

/**
 * Espelha o DTO do back. Os dois ids coexistem porque a notificação é um evento
 * que gera uma entrega por destinatário:
 *
 * - `notificationId` — id do evento. **É a chave de leitura**: o que vai no corpo
 *   do `PATCH /notifications/read`. O destinatário sai do `Authorization`.
 * - `id` — PK da entrega (tabela associativa). Não é aceito pelo endpoint de read;
 *   a UI só usa como `key` de lista.
 *
 * Os três timestamps também vêm do DTO cru: `occurredAt` é do evento, `createdAt` é
 * da entrega, e `timestamp` é o que a UI renderiza hoje. Confirmar com o back qual é
 * o canônico e enxugar — follow-up.
 */
export interface Notification {
  id: string
  notificationId: string
  title: string
  body: string
  source: string
  eventType: string
  type: NotificationType
  occurredAt: string
  timestamp: string
  readAt: string | null
  read: boolean
  createdAt: string
  metadata: Record<string, unknown> | null
}

export interface PagedNotificationsResponse {
  content: Notification[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface GetNotificationsParams {
  status: NotificationStatus
  page?: number
  size?: number
}

export interface MarkAsReadRequest {
  notificationIds: string[]
}
