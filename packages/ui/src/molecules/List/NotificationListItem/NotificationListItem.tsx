import { ListItem } from '../../../atoms/ListItem'
import { Icon, type IconName } from '../../../atoms/Icon'

export type NotificationType = 'CHECKLIST' | 'MAPA' | 'COMUNICADO' | 'OUTRO'

export interface NotificationListItemProps {
  /** Título principal exibido ao usuário */
  title: string
  /** Data/Hora formatada para exibição (ex: "Ontem, 14:30") */
  dateText: string
  /** Tipo da notificação para definir o ícone correspondente */
  type: NotificationType
  /** Define se a notificação foi lida (altera a cor do ícone para cinza) */
  isRead: boolean
  /** Callback para abrir o pop-up com o corpo da notificação */
  onClick?: () => void
}

const iconMap: Record<NotificationType, IconName> = {
  CHECKLIST: 'clipboard-list', 
  MAPA: 'map',
  COMUNICADO: 'newspaper',
  OUTRO: 'bell', 
}

export function NotificationListItem({
  title,
  dateText,
  type,
  isRead,
  onClick
}: NotificationListItemProps) {
  const iconName = iconMap[type] || 'bell'
  const iconColorClass = isRead ? 'text-text-disabled' : 'text-interactive-default'

  return (
    <ListItem 
      selectable={true} 
      selected={false} 
      onClick={onClick}
    >
      <div className="flex w-full items-start gap-4">
        
        <div className={`mt-0.5 flex-shrink-0 ${iconColorClass}`}>
          <Icon name={iconName} size="md" decorative={true} />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-body-md font-medium text-text-default">
            {title}
          </span>
          {/* Metadado exibindo apenas a data, sem o separador e sem o autor */}
          <span className="text-caption-sm text-text-subtle">
            {dateText}
          </span>
        </div>
        
      </div>
    </ListItem>
  )
}