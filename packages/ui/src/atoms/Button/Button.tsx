/**
 * Button — espelha o component set "Button" do DS (variant = primary | outlined).
 * Hover/Focused/Active são pseudo-classes CSS, não props; só `disabled` e
 * `loading` são props. Compõe o átomo `Icon`.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { Icon, type IconName } from '../Icon'

export type ButtonVariant = 'primary' | 'outlined'

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-interactive-default text-text-inverse ' +
    'hover:bg-interactive-hover active:bg-interactive-pressed ' +
    'disabled:bg-interactive-disabled disabled:text-text-disabled disabled:hover:bg-interactive-disabled',
  outlined:
    'border-sm border-interactive-default text-text-brand ' +
    'hover:border-interactive-hover hover:text-interactive-hover ' +
    'active:border-interactive-pressed active:text-interactive-pressed ' +
    'disabled:border-interactive-disabled disabled:text-text-disabled ' +
    'disabled:hover:border-interactive-disabled disabled:hover:text-text-disabled',
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Estilo do botão. Default `primary`. */
  variant?: ButtonVariant
  /** Ícone à esquerda do label (do set aprovado do DS). */
  iconLeft?: IconName
  /** Ícone à direita do label. */
  iconRight?: IconName
  /** Mostra spinner, desabilita e marca aria-busy. */
  loading?: boolean
  /** Ocupa toda a largura disponível. */
  fullWidth?: boolean
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 ' +
  'text-label-xs font-inter cursor-pointer transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed'

export function Button({
  variant = 'primary',
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [base, variantClass[variant], fullWidth ? 'w-full' : undefined, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Icon name="loading-circle" size="sm" decorative />
      ) : (
        iconLeft && <Icon name={iconLeft} size="sm" decorative />
      )}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size="sm" decorative />}
    </button>
  )
}
