import type { AnnouncementDetail } from '../types'

import { AppShell } from '@portal/core'
import { HttpError } from '@portal/core/http/errors'
import { Text } from '@portal/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AnnouncementDetailView } from '../components/organisms/AnnouncementDetailView'
import { getAnnouncement } from '../services'

interface PageAnnouncementDetailProps {
  id: string
}

function resolveFetchError(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.kind === 'network') {
      return 'Não foi possível carregar o comunicado. Verifique sua conexão e tente novamente.'
    }
    if (error.kind === 'forbidden') {
      return 'Você não tem permissão para visualizar este comunicado.'
    }
    if (error.kind === 'not_found') {
      return 'Comunicado não encontrado.'
    }
  }

  return 'Não foi possível carregar o comunicado. Tente novamente mais tarde.'
}

export async function PageAnnouncementDetail({ id }: PageAnnouncementDetailProps) {
  let detail: AnnouncementDetail | undefined
  let errorMessage: string | undefined

  try {
    detail = await getAnnouncement(id)
  } catch (error) {
    if (error instanceof HttpError && error.kind === 'unauthorized') {
      redirect('/login')
    }
    errorMessage = resolveFetchError(error)
  }

  return (
    <AppShell user={null} activeKey="comunicados">
      <div className="p-8">
        <nav className="mb-6" aria-label="Trilha de navegação">
          <Text as="span" variant="label-sm" tone="secondary">
            <Link href="/comunicados" className="hover:text-text-brand transition-colors">
              Mural de Comunicados
            </Link>
            {' / '}
            <Text as="span" variant="label-sm" tone="primary">
              {detail?.announcement.title ?? 'Detalhe'}
            </Text>
          </Text>
        </nav>

        {errorMessage ? (
          <Text as="p" variant="body-md" tone="secondary" role="alert">
            {errorMessage}
          </Text>
        ) : null}

        {detail ? (
          <AnnouncementDetailView detail={detail} canEdit={false} backHref="/comunicados" />
        ) : null}
      </div>
    </AppShell>
  )
}

export default PageAnnouncementDetail
