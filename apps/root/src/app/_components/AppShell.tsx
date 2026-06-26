'use client'

/**
 * AppShell — wrapper que liga o AppLayout (@portal/core) ao roteamento do Next.
 * Define a navegação global (um `router.push` por item) e o item ativo, e
 * embrulha o conteúdo da tela.
 *
 * Provisório: o padrão final de página/rota (domínio dono da page + rota fina em
 * apps/root) fecha com o piloto de Comunicados — ver
 * docs/conventions/layout-e-paginas.md. Até lá, este wrapper centraliza o wiring
 * de navegação num lugar só.
 */
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { AppLayout } from '@portal/core'
import type { SidebarItem } from '@portal/ui'

const NAV: ReadonlyArray<{ key: string; icon: SidebarItem['icon']; label: string; href: string }> = [
  { key: 'checklist', icon: 'clipboard-list', label: 'Checklist', href: '/checklist' },
  { key: 'comunicados', icon: 'newspaper', label: 'Comunicados', href: '/comunicados' },
  { key: 'mapa-salas', icon: 'map', label: 'Mapa de Sala', href: '/mapa-salas' },
  { key: 'config', icon: 'settings', label: 'Configurações', href: '/configuracoes' },
]

export function AppShell({ activeKey, children }: { activeKey: string; children: ReactNode }) {
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
