'use client'

/**
 * AppShell — liga o AppLayout (@portal/core) ao roteamento do Next e ao RBAC.
 * Recebe o `CurrentUser` (resolvido no servidor), filtra os itens de navegação
 * pelo papel do usuário (`filterByPermission`) e semeia o `PermissionsProvider`
 * para que o conteúdo da tela possa usar `useCan`.
 *
 * Provisório: o padrão final de página/rota (Route Group consumindo a page do
 * domínio) fecha com o piloto de Comunicados — ver docs/conventions/layout-e-paginas.md.
 */
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { AppLayout, PermissionsProvider, type CurrentUser } from '@portal/core'
import type { SidebarItem } from '@portal/ui'

import { useUnreadNotificationsCount } from '../notifications/useUnreadNotificationsCount'
import { visibleNavFor } from './navRegistry'

export function AppShell({
  user,
  activeKey,
  children,
}: {
  user: CurrentUser | null
  activeKey: string
  children: ReactNode
}) {
  const router = useRouter()
  const hasUnreadNotifications = useUnreadNotificationsCount()

  const items: SidebarItem[] = visibleNavFor(user).map(
    ({ key, icon, label, href }) => ({
      key,
      icon,
      label,
      onClick: () => router.push(href),
    }),
  )

  return (
    <PermissionsProvider user={user}>
      <AppLayout
        items={items}
        activeKey={activeKey}
        onLogoClick={() => router.push('/comunicados')}
        onNotificationsClick={() => router.push('/notifications')}
        hasUnreadNotifications={hasUnreadNotifications}
      >
        {children}
      </AppLayout>
    </PermissionsProvider>
  )
}
