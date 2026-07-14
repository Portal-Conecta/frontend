'use client'

import { useState, useEffect } from 'react'
import { ListItem } from '../../../atoms/ListItem'
import { Icon, type IconName } from '../../../atoms/Icon'
import { NotificationModal } from '../NotificationModal/NotificationModal'

export type NotificationType = 'CHECKLIST' | 'MAPA' | 'COMUNICADO' | 'OUTRO'

export interface NotificationListItemProps {
  title: string
  body: string
  dateText: string
  type: NotificationType
  isRead: boolean
  onMarkAsRead?: () => void
}

const iconMap: Record<NotificationType, IconName> = {
  CHECKLIST: 'clipboard-list',
  MAPA: 'map',
  COMUNICADO: 'newspaper',
  OUTRO: 'bell',
}

export function NotificationListItem({
  title,
  body,
  dateText,
  type,
  isRead,
  onMarkAsRead
}: NotificationListItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localIsRead, setLocalIsRead] = useState(isRead)

  // Mantém sincronizado caso o backend envie atualizações
  useEffect(() => {
    setLocalIsRead(isRead)
  }, [isRead])

  const iconName = iconMap[type] || 'bell'
  const iconColorClass = localIsRead ? 'text-text-disabled' : 'text-interactive-default'

  const handleOpenNotification = () => {
    setIsOpen(true)
    
    if (!localIsRead) {
      setLocalIsRead(true)
      onMarkAsRead?.()
    }
  }

  return (
    <>
      <ListItem
        selectable={true}
        selected={false}
        onClick={handleOpenNotification}
      >
        <div className="flex w-full items-center gap-4">
          <div className={`mt-1 flex-shrink-0 ${iconColorClass}`}>
            <Icon name={iconName} size="md" decorative={true} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-body-sm font-medium text-text-default leading-tight">
              {title}
            </span>
            <span className="text-label-xs text-text-secondary">
              {dateText}
            </span>
          </div>
        </div>
      </ListItem>

      {/* Renderiza o componente isolado */}
      <NotificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        body={body}
      />
    </>
  )
}