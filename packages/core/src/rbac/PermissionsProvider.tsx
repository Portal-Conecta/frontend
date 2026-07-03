/**
 * Provider + hooks de RBAC para componentes client.
 *
 * O `CurrentUser` é resolvido no servidor (`@portal/core/auth/getCurrentUser`) e
 * semeado aqui uma vez, por request — o client só lê. `useCan` reusa o predicado
 * puro `can`, então a regra de decisão é a mesma da Sidebar, guards e 403.
 */
'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { can } from './can'
import type { CurrentUser, Permission } from './types'

const CurrentUserContext = createContext<CurrentUser | null>(null)

export function PermissionsProvider({
  user,
  children,
}: {
  user: CurrentUser | null
  children: ReactNode
}) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>
}

/** O usuário autenticado da sessão atual, ou `null` se não houver. */
export function useCurrentUser(): CurrentUser | null {
  return useContext(CurrentUserContext)
}

/** O usuário atual tem a permissão? Reativo ao Provider. */
export function useCan(permission: Permission): boolean {
  return can(useContext(CurrentUserContext), permission)
}
