import type { AnnouncementDetail } from '../types'

import { AppShell } from '@portal/core'
import { HttpError } from '@portal/core/http/errors'
import { getUserById } from '@portal/core/profile/profileService'
import { Text } from '@portal/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AnnouncementDetailView } from '../components/AnnouncementDetailView'
import { getAnnouncement } from '../services'

interface PageAnnouncementDetailProps {
  id: string
  /** Origem da navegação (`?from=meus`) — decide pra onde a trilha volta. */
  from?: string
}

const BACK_DESTINATIONS: Record<string, { href: string; label: string }> = {
  meus: { href: '/comunicados/meus', label: 'Painel de gestão de comunicados' },
}
const DEFAULT_BACK_DESTINATION = { href: '/comunicados', label: 'Mural de Comunicados' }

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

export async function PageAnnouncementDetail({ id, from }: PageAnnouncementDetailProps) {
  let detail: AnnouncementDetail | undefined
  let creatorName: string | undefined
  let errorMessage: string | undefined
  const backDestination = (from && BACK_DESTINATIONS[from]) || DEFAULT_BACK_DESTINATION

  try {
    detail = await getAnnouncement(id)
    creatorName = await resolveCreatorName(detail.announcement.createdByUserId)
  } catch (error) {
    if (error instanceof HttpError && error.kind === 'unauthorized') {
      redirect('/login')
    }
    errorMessage = resolveFetchError(error)
  }

  return (
    <AppShell user={null} activeKey="comunicados">
      <div className="p-8">
        <div className="mx-auto w-full max-w-3xl">
          <nav className="mb-6" aria-label="Trilha de navegação">
            <Text as="span" variant="label-sm" tone="secondary">
              <Link href={backDestination.href} className="hover:text-text-brand transition-colors">
                {backDestination.label}
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
              canEdit={false}
              {...(creatorName ? { creatorName } : {})}
            />
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}

export default PageAnnouncementDetail
