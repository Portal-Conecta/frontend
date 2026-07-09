/**
 * SectionItem — item selecionável de uma `Section` (seleção única).
 *
 * É "um button com sublinhado": um `<button>` nativo que mostra um label (Inter
 * SemiBold) e ganha uma **régua inferior** quando `selected`. A régua é uma borda
 * de token (`border/md` = 2px), não o `underline` (text-decoration) do `Button
 * variant="link"` — por isso este átomo é dedicado e não uma variante do `Button`,
 * que é *ação*, não *seleção*.
 *
 * Cor por estado interativo (espelha o `RadioGroup`): padrão `brand`,
 * `hover` → interactive-hover, pressionado (`active`) → interactive-pressed,
 * desabilitado → text-disabled. A régua usa `border-current`, então acompanha a
 * cor do estado; o `Text` não fixa tom (herda a cor do botão).
 *
 * Presentacional: não gerencia grupo nem estado. Dentro de uma `Section`, o
 * controlador injeta `role="radio"`, `aria-checked`, `tabIndex`, `onKeyDown` e
 * `ref` (roving focus) via spread. Standalone, continua sendo um `<button>` válido.
 */
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

import { Text } from '../Text'

export interface SectionItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Aplica a régua inferior de seleção. */
  selected?: boolean
  /** Encaminhado ao `<button>` — a `Section` usa para mover o foco (roving tabindex). */
  ref?: Ref<HTMLButtonElement>
  /** O label do item. */
  children: ReactNode
}

// Sem `rounded-*` no corpo: o border-radius arredondaria as pontas da régua
// inferior. O foco usa anel; a régua fica sempre presente (`border-b-md`) e só
// troca de cor, evitando deslocamento de layout ao selecionar.
const base =
  'inline-flex items-center justify-center whitespace-nowrap pb-1 border-b-md transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed'

export function SectionItem({
  selected = false,
  disabled = false,
  type = 'button',
  ref,
  className,
  children,
  ...rest
}: SectionItemProps) {
  // Cor do texto por estado; `border-current` faz a régua acompanhar a cor.
  const stateClass = disabled
    ? 'text-text-disabled'
    : 'cursor-pointer text-text-brand hover:text-interactive-hover active:text-interactive-pressed'

  const underline = selected ? 'border-current' : 'border-transparent'

  const classes = [base, stateClass, underline, className].filter(Boolean).join(' ')

  return (
    <button ref={ref} type={type} disabled={disabled} className={classes} {...rest}>
      <Text as="span" variant="label-md-emphasis">
        {children}
      </Text>
    </button>
  )
}
