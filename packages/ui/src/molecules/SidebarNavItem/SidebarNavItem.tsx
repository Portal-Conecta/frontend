/**
 * SidebarNavItem — item de navegação da sidebar. Compõe os átomos Icon e Text.
 *
 * Renderiza como `<button>` (sem dep de Next.js no @portal/ui): o consumidor
 * trata a navegação via `onClick`. Estados visuais (default/hover/focus/active)
 * vivem em pseudo-classes CSS + a prop `active`; ícone e texto herdam a cor do
 * botão via currentColor. Responsivo por breakpoint (Item-md → Item-xl), sem
 * prop de tamanho. `collapsed` esconde o label visualmente mantendo-o para
 * leitores de tela.
 */
import { Icon, type IconName } from '../../atoms/Icon'
import { Text } from '../../atoms/Text'

export interface SidebarNavItemProps {
  icon: IconName
  label: string
  active?: boolean
  collapsed?: boolean
  onClick?: () => void
  className?: string
}

export function SidebarNavItem({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick,
  className,
}: SidebarNavItemProps) {
  // Borda transparente sempre presente (border-sm) para reservar 1px e evitar
  // deslocamento de layout quando o foco a colore. Cores de ícone e texto
  // herdam o currentColor do botão — por isso o estado vive nas classes aqui.
  const buttonClasses = [
    'relative flex w-full items-center justify-center gap-3 px-4 py-2 rounded-md',
    'border-sm border-transparent transition-colors',
    'focus-visible:outline-none focus-visible:border-border-focus focus-visible:text-text-brand',
    active ? 'text-interactive-pressed' : 'text-text-secondary hover:text-interactive-hover',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const labelClasses = ['lg:text-body-xl', collapsed ? 'sr-only' : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={buttonClasses}
    >
      <Icon name={icon} size="md" className="shrink-0 lg:w-8 lg:h-8" decorative />
      <Text variant="body-sm" as="span" className={labelClasses}>
        {label}
      </Text>
      {active && !collapsed && (
        <span
          className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-interactive-pressed"
          aria-hidden="true"
        />
      )}
    </button>
  )
}
