/**
 * Button — espelha o component set "Button" do DS. Separa dois eixos:
 * `variant` (forma: solid | outlined | ghost | link) e `tone` (cor semântica:
 * brand | positive | negative). Hover/Focused/Active são pseudo-classes CSS,
 * não props; só `disabled` e `loading` são props. Compõe o átomo `Icon`.
 *
 * Modo icon-only: omita `children` e passe `icon` — o botão fica quadrado (alvo
 * de toque ~44px) e exige `aria-label` (validado em dev).
 *
 * `tone="overlay"` (botão sobre fundo de marca) ainda não existe — segue como
 * dívida no AGENTS e override pontual no PageLogin.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { Icon, type IconName } from '../Icon'

export type ButtonVariant = 'solid' | 'outlined' | 'ghost' | 'link'
export type ButtonTone = 'brand' | 'positive' | 'negative'

// Combinação (variant × tone) → classes literais. Tailwind v4 purga nomes
// montados dinamicamente, então cada combinação fica escrita por extenso.
const variantToneClass: Record<ButtonVariant, Record<ButtonTone, string>> = {
  solid: {
    brand:
      'bg-interactive-default text-text-inverse hover:bg-interactive-hover active:bg-interactive-pressed ' +
      'disabled:bg-interactive-disabled disabled:text-text-disabled disabled:hover:bg-interactive-disabled',
    // NOTA a11y: branco sobre o verde 500 dá ~2,44:1 (reprova AA). Mantido por
    // ora a pedido do TL — contraste a validar com Design antes do merge.
    positive:
      'bg-interactive-positive-default text-text-inverse hover:bg-interactive-positive-hover active:bg-interactive-positive-pressed ' +
      'disabled:bg-interactive-disabled disabled:text-text-disabled disabled:hover:bg-interactive-disabled',
    negative:
      'bg-interactive-negative-default text-text-inverse hover:bg-interactive-negative-hover active:bg-interactive-negative-pressed ' +
      'disabled:bg-interactive-disabled disabled:text-text-disabled disabled:hover:bg-interactive-disabled',
  },
  outlined: {
    brand:
      'border-sm border-interactive-default text-interactive-default hover:border-interactive-hover hover:text-interactive-hover ' +
      'active:border-interactive-pressed active:text-interactive-pressed ' +
      'disabled:border-interactive-disabled disabled:text-text-disabled disabled:hover:border-interactive-disabled disabled:hover:text-text-disabled',
    positive:
      'border-sm border-interactive-positive-default text-interactive-positive-default hover:border-interactive-positive-hover hover:text-interactive-positive-hover ' +
      'active:border-interactive-positive-pressed active:text-interactive-positive-pressed ' +
      'disabled:border-interactive-disabled disabled:text-text-disabled disabled:hover:border-interactive-disabled disabled:hover:text-text-disabled',
    negative:
      'border-sm border-interactive-negative-default text-interactive-negative-default hover:border-interactive-negative-hover hover:text-interactive-negative-hover ' +
      'active:border-interactive-negative-pressed active:text-interactive-negative-pressed ' +
      'disabled:border-interactive-disabled disabled:text-text-disabled disabled:hover:border-interactive-disabled disabled:hover:text-text-disabled',
  },
  ghost: {
    brand:
      'text-interactive-default hover:bg-interactive-subtle hover:text-interactive-hover active:bg-interactive-subtle active:text-interactive-pressed ' +
      'disabled:text-text-disabled disabled:hover:bg-transparent',
    positive:
      'text-interactive-positive-default hover:bg-interactive-positive-subtle hover:text-interactive-positive-hover active:bg-interactive-positive-subtle active:text-interactive-positive-pressed ' +
      'disabled:text-text-disabled disabled:hover:bg-transparent',
    negative:
      'text-interactive-negative-default hover:bg-interactive-negative-subtle hover:text-interactive-negative-hover active:bg-interactive-negative-subtle active:text-interactive-negative-pressed ' +
      'disabled:text-text-disabled disabled:hover:bg-transparent',
  },
  link: {
    brand:
      'text-interactive-default underline hover:text-interactive-hover active:text-interactive-pressed disabled:text-text-disabled disabled:no-underline',
    positive:
      'text-interactive-positive-default underline hover:text-interactive-positive-hover active:text-interactive-positive-pressed disabled:text-text-disabled disabled:no-underline',
    negative:
      'text-interactive-negative-default underline hover:text-interactive-negative-hover active:text-interactive-negative-pressed disabled:text-text-disabled disabled:no-underline',
  },
}

// Anel de foco acompanha o tom.
const focusRingClass: Record<ButtonTone, string> = {
  brand: 'focus-visible:ring-interactive-focus-ring',
  positive: 'focus-visible:ring-interactive-positive-focus-ring',
  negative: 'focus-visible:ring-interactive-negative-focus-ring',
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Forma do botão. Default `solid`. */
  variant?: ButtonVariant
  /** Cor semântica, vinda de token. Default `brand`. */
  tone?: ButtonTone
  /** Ícone do modo icon-only (sem `children`). Exige `aria-label`. */
  icon?: IconName
  /** Ícone à esquerda do label (do set aprovado do DS). */
  iconLeft?: IconName
  /** Ícone à direita do label. */
  iconRight?: IconName
  /** Mostra spinner, desabilita e marca aria-busy. */
  loading?: boolean
  /** Ocupa toda a largura disponível. */
  fullWidth?: boolean
  /** Opcional: quando ausente e `icon` presente, o botão é icon-only. */
  children?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 text-label-md-emphasis font-inter cursor-pointer transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed'

export function Button({
  variant = 'solid',
  tone = 'brand',
  icon,
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className,
  children,
  'aria-label': ariaLabel,
  ...rest
}: ButtonProps) {
  const isIconOnly = children == null && icon != null

  if (process.env.NODE_ENV !== 'production' && isIconOnly && !ariaLabel) {
    // eslint-disable-next-line no-console
    console.warn('Button: modo icon-only exige `aria-label` para acessibilidade.')
  }

  // Forma da caixa: `link` é texto puro; os demais têm raio + padding (quadrado
  // no icon-only para preservar o alvo de toque).
  const shape =
    variant === 'link' ? 'rounded-sm' : `rounded-md ${isIconOnly ? 'p-2.5' : 'px-4 py-2'}`

  const classes = [
    base,
    shape,
    variantToneClass[variant][tone],
    focusRingClass[tone],
    fullWidth ? 'w-full' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      {...rest}
    >
      {isIconOnly ? (
        <Icon name={loading ? 'loading-circle' : icon!} size="md" decorative />
      ) : (
        <>
          {loading ? (
            <Icon name="loading-circle" size="sm" decorative />
          ) : (
            iconLeft && <Icon name={iconLeft} size="sm" decorative />
          )}
          {children}
          {!loading && iconRight && <Icon name={iconRight} size="sm" decorative />}
        </>
      )}
    </button>
  )
}
