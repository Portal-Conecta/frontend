'use client'

/**
 * AppShell — liga o AppLayout (@portal/core) ao roteamento do Next e ao RBAC.
 * Recebe o `CurrentUser` (resolvido no servidor), filtra os itens de navegação
 * pelo papel do usuário (`filterByPermission`) e semeia o `PermissionsProvider`
 * para que o conteúdo da tela possa usar `useCan`.
 *
 * Dono do estado do `ProfileMenu` (issue #328): o ícone de perfil do
 * `AppHeader` só expõe `onProfileClick`, então o toggle mora aqui, e o painel
 * é renderizado como irmão do `AppLayout` (posição `fixed`, não precisa de
 * portal — sem ancestral com transform entre aqui e o body). Também dono da
 * contagem de notificações não lidas (issue #324, `useUnreadNotificationsCount`),
 * repassada ao `AppHeader` via `hasUnreadNotifications`.
 *
 * Montado uma única vez em `apps/root/src/app/(authenticated)/layout.tsx` (#405):
 * como subárvore de layout, persiste entre navegações — header/sidebar/menu não
 * remontam, o estado `expanded` sobrevive e o unread-count não refetcha por rota.
 * O item ativo da nav é derivado do pathname (`activeKeyFromPathname`), não é
 * mais responsabilidade da página — ver docs/conventions/layout-e-paginas.md.
 */
import { useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { AppLayout, PermissionsProvider, type CurrentUser } from '@portal/core'
import type { SidebarItem } from '@portal/ui'

import { useUnreadNotificationsCount } from '../notifications/useUnreadNotificationsCount'
import { activeKeyFromPathname, visibleNavFor } from './navRegistry'
import { clearProfileMenuCache, ProfileMenu } from './ProfileMenu'

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser | null
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const activeKey = activeKeyFromPathname(pathname ?? '')
  const [menuOpen, setMenuOpen] = useState(false)
  const hasUnreadNotifications = useUnreadNotificationsCount()

  const items: SidebarItem[] = visibleNavFor(user).map(
    ({ key, icon, label, href }) => ({
      key,
      icon,
      label,
      onClick: () => router.push(href),
    }),
  )

  async function handleLogout() {
    setMenuOpen(false)
    clearProfileMenuCache()
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Falha ao chamar /api/auth/logout:', err)
    } finally {
      router.replace('/login')
      router.refresh()
    }
  }

  return (
    <PermissionsProvider user={user}>
      <AppLayout
        items={items}
        activeKey={activeKey}
        onLogoClick={() => router.push('/comunicados')}
        onProfileClick={() => setMenuOpen((value) => !value)}
        profileMenuOpen={menuOpen}
        onNotificationsClick={() => router.push('/notifications')}
        hasUnreadNotifications={hasUnreadNotifications}
      >
        {children}
      </AppLayout>

      <ProfileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigateProfile={() => {
          setMenuOpen(false)
          router.push('/perfil')
        }}
        onLogout={handleLogout}
      />
    </PermissionsProvider>
  )
}
