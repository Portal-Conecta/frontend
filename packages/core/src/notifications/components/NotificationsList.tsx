'use client'

import { useRouter } from 'next/navigation'

import { NotificationListItem } from '@portal/ui/molecules/NotificationListItem/NotificationListItem'
import type { Notification } from '../types'

interface NotificationsListProps {
  notifications: Notification[]
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter()

  /**
   * Marca uma notificação como lida ao ser clicada — PATCH de um único
   * `notificationId`. O item já esmaece otimista (via `onMarkAsRead` da molecule);
   * ao confirmar no back, `router.refresh()` refaz o fetch do Server Component e o
   * item sai do filtro `UNREAD` — some da aba "Não Lidas" e passa a aparecer em
   * "Lidas". Falha silenciosa (log): em erro de rede a lista fica como está.
   */
  const markAsRead = (notificationId: string): void => {
    fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds: [notificationId] }),
    })
      .then((res) => {
        if (res.ok) {
          router.refresh()
        } else {
          console.error(`Falha ao marcar notificação como lida: ${res.status}`)
        }
      })
      .catch((err) => {
        console.error('Falha ao marcar notificação como lida.', err)
      })
  }

  if (notifications.length === 0) {
    return (
      <div className="flex w-full items-center justify-center text-body-md text-text-subtle">
        Nenhuma notificação encontrada.
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border-default rounded-md">
      {notifications.map((notification) => (
        <NotificationListItem
          key={notification.id}
          title={notification.title}
          body={notification.body}
          type={notification.type}
          isRead={notification.read}
          dateText={formatTimestamp(notification.timestamp)}
          onMarkAsRead={() => markAsRead(notification.notificationId)}
        />
      ))}
    </div>
  )
}
