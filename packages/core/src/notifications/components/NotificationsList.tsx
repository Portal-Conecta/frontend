import { NotificationListItem } from '@portal/ui/molecules/NotificationListItem/NotificationListItem'
import type { Notification, NotificationType } from '../types'

const ICON_BY_TYPE: Record<NotificationType, string> = {
  CHECKLIST: 'checklist',
  MAPA: 'mapa',
  COMUNICADO: 'comunicado',
  OUTRO: 'outro',
}

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
      <div className="flex w-full items-center justify-center p-8 text-body-md text-text-subtle">
        Nenhuma notificação encontrada.
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border-default rounded-md border border-border-default bg-background-default">
      {notifications.map((notification) => (
        <NotificationListItem
          key={notification.id}
          title={notification.title}
          body={notification.body}
          type={notification.type}
          isRead={notification.read} // Mapeando a prop 'read' do backend para o 'isRead' do componente
          dateText={formatTimestamp(notification.timestamp)}
        />
      ))}
    </div>
  )
}
