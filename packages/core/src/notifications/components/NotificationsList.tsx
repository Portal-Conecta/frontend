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
        />
      ))}
    </div>
  )
}
