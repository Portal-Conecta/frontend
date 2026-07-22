/**
 * PageUserProfile — visão admin do perfil de outro usuário (`/usuarios/[id]`, #443).
 *
 * Decisão de reaproveitamento (issue “A decidir”): tela **separada** do
 * self-service (`PageProfile`) — RBAC e Status diferentes — mas reusa os mesmos
 * atoms/molecules (`Avatar`, `ClassCard`, `ROLE_LABELS`, `Tag`).
 *
 * Localização: `@portal/core` (mesmo padrão da listagem #440 / PR #468). A issue
 * #443 pedia domínio novo de Gestão de Usuários — **merge condicionado a OK
 * explícito do Tech Lead de Front-End** (régua do AGENTS.md); extrair
 * `packages/usuarios` fica como follow-up se o TL preferir o Definido literal.
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
  // Dispara em paralelo (elimina o waterfall — #484, mesmo padrão do #407 em
  // PageProfile.tsx): getUserById não depende do resultado de
  // loadUserClassCard nem vice-versa, ambos só precisam de userId+token.
  // Trade-off aceito: toda visualização de perfil passa a chamar
  // GET /users/{id}/class, mesmo pra quem nunca tem turma (professor/admin) —
  // resposta 404 vira null e é descartada abaixo quando o papel não se aplica.
  const [userResult, classCardResult] = await Promise.allSettled([
    getUserById(userId, token),
    loadUserClassCard(userId, token),
  ])

  if (userResult.status === 'rejected') {
    const err = userResult.reason
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
  const user: UserById = userResult.value

  let classCard: ClassCardItem | null = null
  let classesFailed = false

  // Turma só faz sentido para papéis com vínculo de turma no hub — descarta o
  // resultado (sucesso ou falha) de loadUserClassCard pra outros papéis.
  if (user.typeUser === 'STUDENT' || user.typeUser === 'REPRESENTATIVE') {
    if (classCardResult.status === 'fulfilled') {
      classCard = classCardResult.value
    } else {
      const err = classCardResult.reason
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
