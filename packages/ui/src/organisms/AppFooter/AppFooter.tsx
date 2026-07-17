/**
 * AppFooter — rodapé do AppLayout, presente em todos os breakpoints. Compõe o
 * átomo Text. Organismo **controlado**: o estado `sidebarExpanded` vive no shell
 * (AppLayout) — a faixa do `leftSlot` reusa as larguras do rail
 * (`SIDEBAR_WIDTH_*`) e anima em lockstep com a Sidebar.
 *
 * No desktop (≥lg) o footer faz parte do frame: a faixa do `leftSlot` (largura
 * do rail) fica em `background/default` (cinza) e o restante em
 * `background/surface` (branco, continuando o painel de conteúdo), com a borda
 * do frame (`border-l`) fechando a coluna da sidebar.
 */
import type { ReactNode } from 'react'

import { Text } from '../../atoms/Text'
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '../../tokens'

export interface AppFooterProps {
  /** Espelha o estado da Sidebar (vive no AppLayout). Dimensiona a faixa do `leftSlot`. */
  sidebarExpanded?: boolean
  /** Conteúdo da faixa alinhada ao rail (ex.: o toggle "Reduzir" do shell). */
  leftSlot?: ReactNode
  className?: string
}

const links = [
  { label: 'Central de Ajuda', href: '/ajuda' },
  { label: 'Política de Privacidade', href: '/privacidade' },
  { label: 'Contato', href: '/contato' },
]

export function AppFooter({ sidebarExpanded = false, leftSlot, className }: AppFooterProps) {
  const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  const footerClasses = ['flex min-h-[60px] lg:h-[60px] lg:bg-background-surface', className]
    .filter(Boolean)
    .join(' ')

  return (
    <footer className={footerClasses}>
      {/* Faixa alinhada ao rail (desktop): cinza do frame + largura em lockstep com a Sidebar. */}
      <div
        className="hidden shrink-0 self-stretch transition-[width] duration-300 ease-in-out lg:flex lg:items-center lg:justify-center lg:bg-background-default"
        style={{ width: sidebarWidth }}
      >
        {leftSlot}
      </div>

      {/* Conteúdo: copyright + links. `border-l` fecha a coluna da sidebar no eixo do rail. */}
      <div className="flex w-full flex-col items-center gap-2 px-6 py-2 lg:flex-row lg:justify-between lg:py-0 lg:border-l lg:border-border-default lg:px-10">
        <Text variant="label-xs" tone="secondary" as="span" className="order-2 text-center lg:order-1 lg:text-label-sm">
          Copyright @{new Date().getFullYear()} CentroWEG · Todos os direitos reservados
        </Text>

        <nav aria-label="Links do rodapé" className="order-1 flex gap-4 text-center lg:order-2 lg:gap-6">
          {links.map(({ label, href }) => (
            <Text
              key={href}
              as="a"
              href={href}
              variant="label-sm"
              tone="primary"
              className="transition-colors hover:text-text-brand lg:text-label-md"
            >
              {label}
            </Text>
          ))}
        </nav>
      </div>
    </footer>
  )
}
