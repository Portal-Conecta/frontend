import type { AnnouncementSummary } from '../types'

import { AppShell } from '@portal/core'
import { getSession } from '@portal/core/auth/session'
import { Text } from '@portal/ui'
import { redirect } from 'next/navigation'

import { AnnouncementsBoard } from '../components/AnnouncementsBoard'
import { ComunicadosApiError, listPosts } from '../services'

function resolveFetchError(error: unknown): string {
  if (error instanceof ComunicadosApiError) {
    if (error.kind === 'network') {
      return 'Não foi possível carregar os comunicados. Verifique sua conexão e tente novamente.'
    }
    if (error.kind === 'forbidden') {
      return 'Você não tem permissão para ver estes comunicados.'
    }
    if (error.kind === 'not_found') {
      return 'Não foi possível encontrar os comunicados solicitados.'
    }
  }

  return 'Não foi possível carregar os comunicados. Tente novamente mais tarde.'
}

export async function PageAnnouncements() {
  const token = await getSession()
  if (!token) redirect('/login')

  let items: AnnouncementSummary[] = []
  let errorMessage: string | undefined

  try {
    const result = await listPosts({ page: 0, size: 20 }, token)
    items = result.items
  } catch (error) {
    if (error instanceof ComunicadosApiError && error.kind === 'unauthorized') {
      redirect('/login')
    }
    errorMessage = resolveFetchError(error)
  }

  return (
    <AppShell activeKey="comunicados">
      <div className="p-8">
        <Text as="h1" variant="heading-h2" tone="primary">
          Mural de Comunicados
        </Text>
        <Text as="p" variant="body-md" tone="secondary" className="mt-2">
          Acompanhe os comunicados internos do CentroWEG.
        </Text>
        <AnnouncementsBoard
          items={items}
          {...(errorMessage ? { errorMessage } : {})}
        />
      </div>
    </AppShell>
  )
}

export default PageAnnouncements
