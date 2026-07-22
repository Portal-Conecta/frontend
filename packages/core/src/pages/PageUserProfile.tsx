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

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { PermissionGate } from '../layout/PermissionGate'
import { getUserById } from '../profile/profileService'
import { loadUserClassCard } from '../users/loadUserClassCard'
import { PageUserProfileContent } from './PageUserProfileContent'
import { resolveUserProfileState } from './resolveUserProfileState'

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

  const state = resolveUserProfileState(userResult, classCardResult)

  if (state.kind === 'redirect-login') {
    redirect('/login')
  }
  if (state.kind === 'error') {
    return <ErrorPage {...state.presentation} />
  }

  return (
    <PageUserProfileContent
      user={state.user}
      classCard={state.classCard}
      classesFailed={state.classesFailed}
    />
  )
}

export default PageUserProfile
