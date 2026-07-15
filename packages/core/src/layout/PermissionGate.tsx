import type { ReactNode } from 'react'

import { ErrorPage } from '@portal/ui'

import { can, type CurrentUser, type Permission } from '../rbac'
import { ERROR_PRESENTATION } from '../http/errorPresentation'

/**
 * Guard de RBAC (server component). Nega → renderiza a `ErrorPage` de 403;
 * permite → renderiza os `children`. O 403 é decisão de render (não exceção),
 * então mora aqui e não no `error.tsx`. Uso: dentro do `AppShell`, para o 403
 * aparecer com a navegação do papel.
 *
 *   <AppShell user={user} activeKey="...">
 *     <PermissionGate user={user} permission="comunicados:criar">
 *       {conteúdo}
 *     </PermissionGate>
 *   </AppShell>
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
