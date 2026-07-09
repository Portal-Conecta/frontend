import { redirect } from 'next/navigation'

import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { MarkPageAsRead } from '../notifications/components/MarkPageAsRead'
import { NotificationsFilters } from '../notifications/components/NotificationsFilters'
import { NotificationsList } from '../notifications/components/NotificationsList'
import { NotificationsPagination } from '../notifications/components/NotificationsPagination'
import { UnreadBatchControls } from '../notifications/components/UnreadBatchControls'
import { DEFAULT_PAGE_SIZE, getNotifications } from '../notifications/notificationService'
import type { NotificationStatus } from '../notifications/types'

interface PageNotificationsProps {
  searchParams: Promise<{ status?: string; page?: string; size?: string }>
}

function parseIndex(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

export async function PageNotifications({ searchParams }: PageNotificationsProps) {
  const params = await searchParams
  const status: NotificationStatus = params.status === 'read' ? 'READ' : 'UNREAD'

  const parsedSize = parseIndex(params.size, DEFAULT_PAGE_SIZE)
  const size = parsedSize > 0 ? parsedSize : DEFAULT_PAGE_SIZE

  // A aba "Não Lidas" ignora `?page=`: abrir a página marca os itens como lidos, o
  // conjunto encolhe, e a fatia seguinte é sempre a página 0 (ver UnreadBatchControls).
  const page = status === 'READ' ? parseIndex(params.page, 0) : 0

  const accessToken = await getSession()
  if (!accessToken) {
    redirect('/login')
  }

  let data
  try {
    data = await getNotifications(accessToken, { status, page, size })
  } catch (err) {
    if (err instanceof HttpError && err.kind === 'unauthorized') {
      redirect('/login')
    }
    throw err
  }

  const unreadIds =
    status === 'UNREAD' ? data.content.map((notification) => notification.notificationId) : []

  return (
    <div>
      <h1>Notificação</h1>
      <NotificationsFilters activeStatus={status} />
      <NotificationsList notifications={data.content} />

      {status === 'UNREAD' ? (
        <>
          <UnreadBatchControls shown={data.content.length} totalElements={data.totalElements} />
          {unreadIds.length > 0 && <MarkPageAsRead notificationIds={unreadIds} />}
        </>
      ) : (
        <NotificationsPagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={data.size}
        />
      )}
    </div>
  )
}
