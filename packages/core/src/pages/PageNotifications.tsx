import { redirect } from 'next/navigation'

import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { NotificationsFilters } from '../notifications/components/NotificationsFilters'
import { NotificationsList } from '../notifications/components/NotificationsList'
import { NotificationsPagination } from '../notifications/components/NotificationsPagination'
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

  // Ambas as abas paginam por offset. Antes a aba "Não Lidas" fixava page 0
  // porque abrir a tela marcava o lote inteiro como lido e a fatia seguinte
  // voltava a ser a 0; agora a leitura é por clique, então ela navega por página
  // como a aba "Lidas".
  const page = parseIndex(params.page, 0)

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

  return (
    <div className="mx-auto flex w-full max-w-[1024px] flex-col p-6 md:p-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4">
        <h2 className="text-text-brand text text-body-xl-emphasis mb-8">
          Notificações
        </h2>
        {/* Rodapé com controles/paginação */}
      <div className="flex min-h-11 items-center place-content-between gap-4">

        <NotificationsFilters activeStatus={status} />

        <NotificationsPagination
          page={data.page ?? page}
          totalPages={data.totalPages ?? 0}
          totalElements={data.totalElements ?? 0}
          size={data.size ?? size}
        />
      </div>
      </div>

      {/* Lista com o componente NotificationListItem */}
      <NotificationsList notifications={data.content} />
    </div>
  )
}