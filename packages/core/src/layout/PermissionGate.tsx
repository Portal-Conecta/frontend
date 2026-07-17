import type { ReactNode } from 'react'

import { ErrorPage } from '@portal/ui'

import { can, type CurrentUser, type Permission } from '../rbac'
import { ERROR_PRESENTATION } from '../http/errorPresentation'

/**
 * Guard de RBAC (server component). Nega → renderiza a `ErrorPage` de 403;
 * permite → renderiza os `children`. O 403 é decisão de render (não exceção),
 * então mora aqui e não no `error.tsx`. Uso: no conteúdo de uma página
 * autenticada — o `AppShell` vem do layout `(authenticated)`, então o 403
 * já aparece com a navegação do papel.
 *
 *   <PermissionGate user={user} permission="comunicados:criar">
 *     {conteúdo}
 *   </PermissionGate>
 */

export interface PermissionGateProps {
  user: CurrentUser | null
  permission: Permission
  children: ReactNode
}

export function PermissionGate({ user, permission, children }: PermissionGateProps) {
  if (!can(user, permission)) {
    return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
  }
  return <>{children}</>
}
