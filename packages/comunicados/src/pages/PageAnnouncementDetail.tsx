import type { AnnouncementDetail } from '../types'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { HttpError } from '@portal/core/http/errors'
import { getUserById } from '@portal/core/profile/profileService'
import { Text } from '@portal/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { AnnouncementDetailView } from '../components/AnnouncementDetailView'
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

async function resolveCreatorName(userId: string): Promise<string | undefined> {
  try {
    const user = await getUserById(userId)
    return user.name
  } catch {
    // 404 (inativo) ou falha de rede não bloqueiam a leitura do comunicado.
    return undefined
  }
}

export async function PageAnnouncementDetail({ id }: PageAnnouncementDetailProps) {
  const user = await getCurrentUser()

  let detail: AnnouncementDetail | undefined
  let creatorName: string | undefined
  let errorMessage: string | undefined

  try {
    detail = await getAnnouncement(id)
    creatorName = await resolveCreatorName(detail.announcement.createdByUserId)
  } catch (error) {
    if (error instanceof HttpError && error.kind === 'unauthorized') {
      redirect('/login')
    }
    errorMessage = resolveFetchError(error)
  }

  const canEdit =
    Boolean(detail) &&
    canCreateAnnouncement(user) &&
    user?.id === detail?.announcement.createdByUserId &&
    detail?.announcement.status !== 'REMOVED'

  return (
    <AppShell user={user} activeKey="comunicados">
      <div className="p-8">
        <div className="mx-auto w-full max-w-3xl">
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
            <AnnouncementDetailView
              detail={detail}
              canEdit={canEdit}
              {...(creatorName ? { creatorName } : {})}
            />
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}

export default PageAnnouncementDetail
