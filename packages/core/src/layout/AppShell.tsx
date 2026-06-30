'use client'

/**
 * AppShell — wrapper que liga o AppLayout ao roteamento do Next.js.
 * Define a navegação global (um `router.push` por item) e o item ativo, e
 * embrulha o conteúdo da tela.
 *
 * Vive em `@portal/core` para que páginas de domínio (`@portal/comunicados`, etc.)
 * usem o shell sem importar `apps/root`. Padrão fechado no piloto de Comunicados —
 * ver docs/conventions/layout-e-paginas.md.
 */
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import type { SidebarItem } from '@portal/ui'

import { AppLayout } from './AppLayout'

const NAV: ReadonlyArray<{ key: string; icon: SidebarItem['icon']; label: string; href: string }> = [
  { key: 'checklist', icon: 'clipboard-list', label: 'Checklist', href: '/checklist' },
  { key: 'comunicados', icon: 'newspaper', label: 'Comunicados', href: '/comunicados' },
  { key: 'mapa-salas', icon: 'map', label: 'Mapa de Sala', href: '/mapa-salas' },
  { key: 'config', icon: 'settings', label: 'Configurações', href: '/configuracoes' },
]

export interface AppShellProps {
  activeKey: string
  children: ReactNode
}

export function AppShell({ activeKey, children }: AppShellProps) {
  const router = useRouter()

  const items: SidebarItem[] = NAV.map(({ key, icon, label, href }) => ({
    key,
    icon,
    label,
    onClick: () => router.push(href),
  }))

  return (
    <AppLayout items={items} activeKey={activeKey} onLogoClick={() => router.push('/comunicados')}>
      {children}
    </AppLayout>
  )
}
