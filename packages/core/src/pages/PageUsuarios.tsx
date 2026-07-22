/**
 * PageUsuarios — tela de lista de usuários (rota `/usuarios`, issue #440).
 *
 * Server Component: sessão + gate `usuarios:gerenciar` + SSR da lista inicial.
 * Interação (busca/filtros) fica no `PageUsuariosContent`.
 */
import { redirect } from 'next/navigation'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import type { DirectoryUser } from '../classes/types'
import { searchUsers } from '../classes/userDirectoryService'
import { can } from '../rbac/can'
import { ALL_USER_ACCOUNT_STATUSES } from '../users/usersLabels'
import { DEFAULT_USERS_PAGE_SIZE } from '../users/toListUsersParams'
import { PageUsuariosContent } from './PageUsuariosContent'

export async function PageUsuarios() {
  const token = await getSession()
  if (!token) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  if (!can(user, 'usuarios:gerenciar')) {
    redirect('/comunicados')
  }

  let users: DirectoryUser[] = []
  let totalElements = 0
  let failed = false
  try {
    const result = await searchUsers(
      {
        page: 0,
        size: DEFAULT_USERS_PAGE_SIZE,
        status: ALL_USER_ACCOUNT_STATUSES,
      },
      token,
    )
    users = result.content
    totalElements = result.totalElements
  } catch {
    failed = true
  }

  return (
    <PageUsuariosContent
      initialUsers={users}
      initialTotalElements={totalElements}
      initialError={failed}
    />
  )
}

export default PageUsuarios
