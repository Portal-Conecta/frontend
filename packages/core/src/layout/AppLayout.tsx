/**
 * AppLayout — shell padrão de toda página interna autenticada (ADR-0004,
 * docs/conventions/layout-e-paginas.md). Compõe os organismos AppHeader (topo),
 * Sidebar (lateral) e AppFooter (rodapé) ao redor de um slot de conteúdo.
 *
 * É a **fonte única** do estado `expanded` da sidebar: o bloco da logo do
 * header, o rail e o `leftSlot` do footer animam em lockstep a partir dele
 * (todos usam `SIDEBAR_WIDTH_*`).
 *
 * O controle de colapso no desktop vive no `leftSlot` do footer — por isso a
 * Sidebar entra com `railToggle={false}` (evita dois toggles). No tablet/mobile,
 * o FAB e o drawer da própria Sidebar cuidam disso.
 *
 * Visual: mobile/tablet é todo branco (sidebar é overlay); desktop é um "frame"
 * cinza (`background/default`) — header + rail + a faixa do footer sob o rail —
 * envolvendo um painel de conteúdo branco (`background/surface`) que se estende
 * pela faixa do footer à direita do rail, com canto superior-esquerdo arredondado.
 *
 * A borda do frame (`border-border-default`) é dona do shell, não dos organismos:
 * mora nos lados topo/esquerda/base do `<main>` — debaixo do header, à direita do
 * rail e em cima do footer. Por isso a Sidebar não desenha mais `border-r`.
 */
'use client'

import { useCallback, useState, type ReactNode } from 'react'

import { AppFooter, AppHeader, Sidebar, SidebarNavItem, type SidebarItem } from '@portal/ui'

export interface AppLayoutProps {
  /** Conteúdo da tela (área central rolável). */
  children: ReactNode
  /** Itens de navegação da sidebar (`{ key, icon, label, onClick? }`). */
  items: SidebarItem[]
  /** Key do item de navegação ativo. */
  activeKey?: string
  /** Estado inicial da sidebar. Default colapsado (`false`). */
  defaultExpanded?: boolean
  /** Clique na logo do header — navegação para a home. */
  onLogoClick?: () => void
  /** Clique no perfil (header). */
  onProfileClick?: () => void
  /** Menu de perfil aberto (header) — alimenta aria-expanded do gatilho. */
  profileMenuOpen?: boolean
  /** Clique nas notificações (header). */
  onNotificationsClick?: () => void
  /** Há notificação não lida — sobrepõe um dot vermelho no sino do header. */
  hasUnreadNotifications?: boolean
  /** Clique em "mais opções" (header). */
  onMoreOptionsClick?: () => void
}

export function AppLayout({
  children,
  items,
  activeKey,
  defaultExpanded = false,
  onLogoClick,
  onProfileClick,
  profileMenuOpen = false,
  onNotificationsClick,
  hasUnreadNotifications = false,
  onMoreOptionsClick,
}: AppLayoutProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  // Estável: a Sidebar usa `onToggle` num efeito de focus-trap; uma identidade
  // nova a cada render re-rodaria o efeito com o drawer aberto.
  const toggle = useCallback(() => setExpanded((value) => !value), [])

  // Spread condicional: com `exactOptionalPropertyTypes`, não se passa `undefined`
  // explícito a uma prop opcional — só se inclui a chave quando há valor.
  const headerActions = {
    ...(onLogoClick ? { onLogoClick } : {}),
    ...(onProfileClick ? { onProfileClick } : {}),
    ...(onNotificationsClick ? { onNotificationsClick } : {}),
    ...(onMoreOptionsClick ? { onMoreOptionsClick } : {}),
  }

  return (
    <div className="flex h-screen flex-col bg-background-surface lg:bg-background-default">
      <AppHeader
        sidebarExpanded={expanded}
        hasUnreadNotifications={hasUnreadNotifications}
        profileMenuOpen={profileMenuOpen}
        {...headerActions}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          items={items}
          expanded={expanded}
          onToggle={toggle}
          railToggle={false}
          {...(activeKey ? { activeKey } : {})}
        />
        <main className="flex-1 overflow-y-auto bg-background-surface lg:rounded-tl-xl lg:border-t lg:border-l lg:border-b lg:border-border-default">
          {children}
        </main>
      </div>

      <AppFooter
        sidebarExpanded={expanded}
        leftSlot={
          <SidebarNavItem
            icon={expanded ? 'chevrons-left' : 'chevrons-right'}
            label="Reduzir"
            collapsed={!expanded}
            onClick={toggle}
          />
        }
      />
    </div>
  )
}
