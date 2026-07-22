'use client'

import type { NotificationStatus } from '../types'
import { useRouter } from 'next/navigation'
import { Section } from '@portal/ui'

interface NotificationsFiltersProps {
  activeStatus: NotificationStatus
}

export function NotificationsFilters({ activeStatus }: NotificationsFiltersProps) {
  const router = useRouter()

  const handleTabChange = (value: string) => {
    // Transforma o valor do componente na query string da URL
    const statusQuery = value === 'UNREAD' ? 'unread' : 'read'
    router.push(`/notifications?status=${statusQuery}`)
  }

  return (
    <Section
      aria-label="Filtrar tipo de notificação"
      value={activeStatus}
      onChange={handleTabChange}
      options={[
        { label: 'Não Lidas', value: 'UNREAD' },
        { label: 'Lidas', value: 'READ' }
      ]}
    />
  )
}
