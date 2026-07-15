import type { HTMLAttributes, ReactNode } from 'react'

export interface ListItemProps extends HTMLAttributes<HTMLElement> {
  /** Conteúdo do item */
  children?: ReactNode
  /** Define se o item é interativo (comporta-se como botão, altera o cursor e a semântica) */
  selectable?: boolean
  /** Estado de selecionado: ganha borda completa usando o token pressed */
  selected?: boolean
  /** Desabilita o efeito de hover na borda inferior */
  disableHover?: boolean
}

// Base: fundo transparente, espaçamentos, text-left (para resetar alinhamento de button) e transição
const baseClasses = 'bg-transparent p-4 w-full text-left transition-colors'

function getBorderClasses(selected: boolean, disableHover: boolean) {
  if (selected) return 'border border-interactive-pressed rounded-md' // Selecionado: borda completa
  return `border-b border-border-default rounded-none ${
    !disableHover ? 'hover:border-interactive-default' : ''
  }` // Padrão: border-bottom.
}

function getInteractiveClasses(interactive: boolean) {
  return interactive
    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-interactive-focus-ring'
    : ''
}

export function ListItem({
  children,
  selectable = false,
  selected = false,
  disableHover = false,
  className = '',
  onClick,
  ...rest
}: ListItemProps) {
  const interactive = selectable || Boolean(onClick)

  const classes = [
    baseClasses,
    getBorderClasses(selected, disableHover),
    getInteractiveClasses(interactive),
    className,
  ].filter(Boolean).join(' ')

  // Renderiza como button se for interativo para garantir acessibilidade (a11y) nativa
  const Component = interactive ? 'button' : 'div'

  return (
    <Component
      className={classes}
      onClick={onClick}
      // aria-pressed informa a leitores de tela o estado atual de seleção
      aria-pressed={interactive ? selected : undefined}
      type={Component === 'button' ? 'button' : undefined}
      {...rest}
    >
      {children}
    </Component>
  )
}