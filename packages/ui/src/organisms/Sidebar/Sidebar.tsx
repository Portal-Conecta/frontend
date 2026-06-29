/**
 * Sidebar — navegação lateral do Portal Conecta. Compõe a molecule
 * SidebarNavItem (+ Logo e Icon). Organismo **controlado**: o estado `expanded`
 * vive no pai (sincroniza com footer/header/conteúdo). Sem dependência de
 * Next.js — navegação via `onClick`/`activeKey` (ADR-0004).
 *
 * Dois comportamentos por breakpoint (corte em `lg` = 1024px):
 * - Desktop (≥lg): rail persistente que anima 96px↔254px e empurra o conteúdo.
 * - Tablet/Mobile (<lg): drawer sobreposto com scrim (expandido) ou um FAB
 *   circular no canto inferior esquerdo (colapsado).
 */
'use client'

import { useEffect, useId, useRef, type CSSProperties } from 'react'

import { Icon, type IconName } from '../../atoms/Icon'
import { Logo } from '../../atoms/Logo'
import { SidebarNavItem } from '../../molecules/SidebarNavItem'
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '../../tokens'

/** Espelha o breakpoint `lg` do Tailwind: acima é rail, abaixo é drawer. */
const LG_BREAKPOINT_PX = 1024

export interface SidebarItem {
  key: string
  icon: IconName
  label: string
  onClick?: () => void
}

export interface SidebarProps {
  items: SidebarItem[]
  activeKey?: string
  expanded: boolean
  onToggle: () => void
  /**
   * Mostra o toggle "Reduzir" no rodapé do rail (desktop). Default `true`.
   * Defina `false` quando o shell (AppLayout) provê o controle de colapso em
   * outro lugar (ex.: no `leftSlot` do footer) — evita dois toggles. Não afeta
   * o FAB nem o "Reduzir" do drawer no mobile.
   */
  railToggle?: boolean
  className?: string
}

/** Lista de navegação reutilizada pelo rail e pelo drawer. */
function NavList({
  items,
  activeKey,
  collapsed,
}: {
  items: SidebarItem[]
  activeKey: string | undefined
  collapsed: boolean
}) {
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1 pt-4">
      {items.map((item) => (
        <SidebarNavItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          active={item.key === activeKey}
          collapsed={collapsed}
          {...(item.onClick ? { onClick: item.onClick } : {})}
        />
      ))}
    </nav>
  )
}

export function Sidebar({ items, activeKey, expanded, onToggle, railToggle = true, className }: SidebarProps) {
  const drawerId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Esc + focus-trap só fazem sentido no modo drawer (<lg). No desktop o drawer
  // fica `display:none`, então o efeito é dispensado via matchMedia para não
  // interferir na navegação por teclado do rail.
  useEffect(() => {
    if (!expanded) return
    if (typeof window !== 'undefined' && window.matchMedia(`(min-width: ${LG_BREAKPOINT_PX}px)`).matches)
      return

    const panel = panelRef.current
    if (!panel) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    panel.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onToggle()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (focusables.length === 0) return

      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [expanded, onToggle])

  const railWidth = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  return (
    <>
      {/* Rail persistente — desktop (≥lg) */}
      <aside
        className={[
          'hidden h-full shrink-0 flex-col overflow-hidden bg-background-default',
          'transition-[width] duration-300 ease-in-out lg:flex',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ width: railWidth }}
      >
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <NavList items={items} activeKey={activeKey} collapsed={!expanded} />
        </div>
        {railToggle && (
          <div className="border-t border-border-default py-2">
            <SidebarNavItem
              icon={expanded ? 'chevrons-left' : 'chevrons-right'}
              label="Reduzir"
              collapsed={!expanded}
              onClick={onToggle}
            />
          </div>
        )}
      </aside>

      {/* Drawer sobreposto — tablet/mobile (<lg), apenas expandido */}
      {expanded && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background-overlay"
            aria-hidden="true"
            onClick={onToggle}
          />
          <div
            ref={panelRef}
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            tabIndex={-1}
            // No tablet (md+) o drawer iguala a largura do rail expandido — sem
            // repetir o literal: o valor vem da constante via custom property.
            style={{ '--sb-drawer-w': `${SIDEBAR_WIDTH_EXPANDED}px` } as CSSProperties}
            className="relative flex h-full w-[280px] max-w-[80%] flex-col rounded-r-xl bg-background-default shadow-lg md:w-[var(--sb-drawer-w)]"
          >
            {/* Espelha o bloco da logo do AppHeader (altura de 64px, `px-6`,
                centralizado) para que a marca não "salte" de posição ao abrir/
                fechar o drawer. Tamanho responsivo: 32px no mobile, 44px no tablet.
                Manter em sincronia com o AppHeader. */}
            <div className="flex h-16 shrink-0 items-center px-6">
              <Logo variant="mark" tone="brand" size={32} className="md:hidden" />
              <Logo variant="mark" tone="brand" size={44} className="hidden md:block" />
            </div>
            <div className="flex-1 overflow-x-hidden overflow-y-auto">
              <NavList items={items} activeKey={activeKey} collapsed={false} />
            </div>
            <div className="border-t border-border-default py-2">
              <SidebarNavItem icon="chevrons-left" label="Reduzir" onClick={onToggle} />
            </div>
          </div>
        </div>
      )}

      {/* FAB de abertura — tablet/mobile (<lg), apenas colapsado */}
      {!expanded && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Abrir menu"
          aria-expanded={false}
          aria-controls={drawerId}
          className={[
            'fixed bottom-4 left-4 z-40 flex h-[48px] w-[48px] items-center justify-center rounded-full',
            'bg-interactive-default text-text-inverse shadow-lg transition-colors',
            'hover:bg-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            'lg:hidden',
          ].join(' ')}
        >
          <Icon name="chevrons-right" size="md" tone="inverse" decorative />
        </button>
      )}
    </>
  )
}
