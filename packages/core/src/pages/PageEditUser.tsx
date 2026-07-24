/**
 * PageEditUser — edição de um usuário existente (`/usuarios/[id]/editar`, #442).
 *
 * Só o campo Nome é editável no Hub (`PATCH /users/{id}` aceita somente esse
 * campo, ver `UpdateUserPayload`); status é resolvido por ações de ciclo de
 * vida separadas ("Ações de risco": inativar/reativar, excluir), não por um
 * campo do formulário — Figma node 3687:21527 não tem toggle nenhum.
 *
 * Mesmo padrão de localização/gate de #440/#443 (`@portal/core`,
 * `usuarios:gerenciar` — régua do AGENTS.md pra `packages/usuarios` segue a
 * mesma pendência de OK do Tech Lead de Front-End).
 */
import { redirect } from 'next/navigation'

import { ErrorPage } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { ERROR_PRESENTATION } from '../http/errorPresentation'
import { PermissionGate } from '../layout/PermissionGate'
import { getUserById } from '../profile/profileService'
import type { UserById } from '../profile/types'
import type { TypeUser } from '../rbac'
import { PageEditUserContent } from './PageEditUserContent'

export interface PageEditUserProps {
  userId: string
}

export async function PageEditUser({ userId }: PageEditUserProps) {
  const token = await getSession()
  if (!token) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  return (
    <PermissionGate user={currentUser} permission="usuarios:gerenciar">
      <EditUserLoader userId={userId} token={token} requesterType={currentUser.userType} />
    </PermissionGate>
  )
}

async function EditUserLoader({
  userId,
  token,
  requesterType,
}: {
  userId: string
  token: string
  requesterType: TypeUser
}) {
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

  return <PageEditUserContent user={user} requesterType={requesterType} />
}

export default PageEditUser
