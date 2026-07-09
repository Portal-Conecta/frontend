import type { Notification, NotificationType } from "../types";

const ICON_BY_TYPE: Record<NotificationType, string> = {
  CHECKLIST: "checklist",
  MAPA: "mapa",
  COMUNICADO: "comunicado",
  OUTRO: "outro",
};

interface NotificationsListProps {
  notifications: Notification[];
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div>
        <p>Nenhuma notificação encontrada.</p>
      </div>
    );
  }

  return (
    <ul>
      {notifications.map((notification) => (
        <li key={notification.id} data-icon={ICON_BY_TYPE[notification.type]}>
          <div>
            <p>{notification.title}</p>
            <span>{formatTimestamp(notification.timestamp)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}