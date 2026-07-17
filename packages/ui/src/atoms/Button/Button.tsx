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
import { cloneElement, isValidElement } from 'react'
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'

import { Icon, type IconName } from '../Icon'

export type ButtonVariant = 'solid' | 'outlined' | 'ghost' | 'link'
export type ButtonTone = 'brand' | 'positive' | 'negative'
export type ButtonSize = 'md' | 'sm' | 'xs'

// Tipografia por tamanho. `sm` espelha os botões compactos do Figma (menus de
// ação de comunicados): label 12px regular (`label-xs`), mesmo padding do `md`.
// `xs` reduz também a caixa (padding + glifo) — usado no modo icon-only compacto,
// onde ~44px não cabe em larguras estreitas.
const sizeClass: Record<ButtonSize, string> = {
  md: 'text-label-md-emphasis',
  sm: 'text-label-xs',
  xs: 'text-label-xs',
}

// Padding por tamanho, separado por modo (icon-only vs rotulado). Todos os
// valores caem na escala de spacing do DS (2 = 8px, 3 = 12px, 4 = 16px).
const iconOnlyPadClass: Record<ButtonSize, string> = {
  md: 'p-2.5',
  sm: 'p-2.5',
  xs: 'p-2',
}
const labeledPadClass: Record<ButtonSize, string> = {
  md: 'px-4 py-2',
  sm: 'px-4 py-2',
  xs: 'px-3 py-2',
}

// Glifo do modo icon-only por tamanho: `xs` desce pra 16px (sm) pra fechar a
// caixa de ~32px.
const iconOnlyGlyph: Record<ButtonSize, 'md' | 'sm'> = {
  md: 'md',
  sm: 'md',
  xs: 'sm',
}

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
  /** Tamanho do botão. Default `md` (16px emphasis); `sm` = 12px regular; `xs` = 12px + caixa reduzida. */
  size?: ButtonSize
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
  /** Aplica comportamento e estilos ao elemento filho, como um `Link`. */
  asChild?: boolean
  /** Opcional: quando ausente e `icon` presente, o botão é icon-only. */
  children?: ReactNode
}

type ButtonChildProps = {
  'aria-busy'?: boolean | undefined
  'aria-disabled'?: boolean | undefined
  'aria-label'?: string | undefined
  className?: string | undefined
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] | undefined
}

const base =
  'inline-flex items-center justify-center gap-2 font-inter cursor-pointer transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed'

export function Button({
  variant = 'solid',
  tone = 'brand',
  size = 'md',
  icon,
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  asChild = false,
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
    variant === 'link'
      ? 'rounded-sm'
      : `rounded-md ${isIconOnly ? iconOnlyPadClass[size] : labeledPadClass[size]}`

  const classes = [
    base,
    sizeClass[size],
    shape,
    variantToneClass[variant][tone],
    focusRingClass[tone],
    fullWidth ? 'w-full' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (asChild) {
    if (!isValidElement<ButtonChildProps>(children)) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Button: `asChild` exige um único elemento React como filho.')
      }

      return null
    }

    const child = children as ReactElement<ButtonChildProps>
    const isDisabled = disabled || loading

    return cloneElement(child, {
      className: [classes, child.props.className].filter(Boolean).join(' '),
      'aria-busy': loading || undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-label': ariaLabel,
      onClick: isDisabled
        ? (event) => {
            event.preventDefault()
          }
        : child.props.onClick,
    })
  }

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
        <Icon name={loading ? 'loading-circle' : icon!} size={iconOnlyGlyph[size]} decorative />
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
