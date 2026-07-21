/**
 * PageUserProfile — visão admin do perfil de outro usuário (`/usuarios/[id]`, #443).
 *
 * Decisão de reaproveitamento (issue “A decidir”): tela **separada** do
 * self-service (`PageProfile`) — RBAC e Status diferentes — mas reusa os mesmos
 * atoms/molecules (`Avatar`, `ClassCard`, `ROLE_LABELS`, `Tag`). Vive em
 * `@portal/core/users` junto com a listagem (#440) até existir pacote de domínio
 * dedicado (novo pacote exige alinhamento TL).
 */
import { redirect } from 'next/navigation'

import { ErrorPage } from '@portal/ui'
import type { ClassCardItem } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { ERROR_PRESENTATION } from '../http/errorPresentation'
import { PermissionGate } from '../layout/PermissionGate'
import { getUserById } from '../profile/profileService'
import type { UserById } from '../profile/types'
import { loadUserClassCard } from '../users/loadUserClassCard'
import { PageUserProfileContent } from './PageUserProfileContent'

export interface PageUserProfileProps {
  userId: string
}

export async function PageUserProfile({ userId }: PageUserProfileProps) {
  const token = await getSession()
  if (!token) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()

  return (
    <PermissionGate user={currentUser} permission="usuarios:gerenciar">
      <UserProfileLoader userId={userId} token={token} />
    </PermissionGate>
  )
}

async function UserProfileLoader({ userId, token }: { userId: string; token: string }) {
  let user: UserById
  try {
    user = await getUserById(userId, token)
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.kind === 'unauthorized') redirect('/login')
      if (err.kind === 'forbidden') {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      }
      if (err.kind === 'not_found') {
        return <ErrorPage {...ERROR_PRESENTATION.not_found} />
      }
    }
    return <ErrorPage {...ERROR_PRESENTATION.server} />
  }

  let classCard: ClassCardItem | null = null
  let classesFailed = false

  // Turma só faz sentido para papéis com vínculo de turma no hub.
  if (user.typeUser === 'STUDENT' || user.typeUser === 'REPRESENTATIVE') {
    try {
      classCard = await loadUserClassCard(userId, token)
    } catch (err) {
      if (err instanceof HttpError && err.kind === 'unauthorized') {
        redirect('/login')
      }
      classesFailed = true
    }
  }

  return (
    <PageUserProfileContent user={user} classCard={classCard} classesFailed={classesFailed} />
  )
}

export default PageUserProfile
