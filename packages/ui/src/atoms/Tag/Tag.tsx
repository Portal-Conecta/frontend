'use client'

/**
 * Tag — rótulo curto de status (Data/Tag no DS WEG).
 * Tom semântico por token, ícone opcional (esquerda/direita) e remoção opcional.
 */
import type { HTMLAttributes, ReactNode } from 'react'

import { Icon, type IconName, type IconSize } from '../Icon'
import { Text, type TextVariant } from '../Text'

export type TagTone = 'neutral' | 'positive' | 'negative' | 'warning' | 'info'
export type TagSize = 'sm' | 'md' | 'lg'
export type TagRadius = 'sm' | 'md' | 'full'
export type TagIconPosition = 'left' | 'right'

const toneClass: Record<TagTone, string> = {
  neutral: 'bg-border-default text-text-primary',
  positive: 'bg-feedback-success text-text-primary',
  negative: 'bg-feedback-error text-text-inverse',
  warning: 'bg-feedback-warning text-text-primary',
  info: 'bg-feedback-info text-text-inverse',
}

const radiusClass: Record<TagRadius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  full: 'rounded-full',
}

const sizeClass: Record<
  TagSize,
  { padding: string; gap: string; text: TextVariant; icon: IconSize }
> = {
  sm: { padding: 'px-3 py-2', gap: 'gap-1', text: 'label-xs', icon: 'xs' },
  md: { padding: 'px-3 py-2', gap: 'gap-3', text: 'label-md', icon: 'sm' },
  lg: { padding: 'px-4 py-2', gap: 'gap-3', text: 'label-md-emphasis', icon: 'sm' },
}

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  children: ReactNode
  tone?: TagTone
  size?: TagSize
  radius?: TagRadius
  icon?: IconName
  iconPosition?: TagIconPosition
  onRemove?: () => void
  removeLabel?: string
}

const removeButtonClass =
  'inline-flex shrink-0 items-center justify-center rounded-sm ' +
  'transition-opacity hover:opacity-80 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2'

export function Tag({
  children,
  tone = 'neutral',
  size = 'md',
  radius = 'full',
  icon,
  iconPosition = 'left',
  onRemove,
  removeLabel = 'Remover',
  className,
  ...rest
}: TagProps) {
  const { padding, gap, text, icon: iconSize } = sizeClass[size]

  // Evita dois "x" quando o ícone decorativo coincide com o botão de remover.
  const decorativeIcon = icon && !(onRemove && icon === 'x') ? icon : undefined

  const classes = [
    'inline-flex w-fit max-w-full self-start shrink-0 items-center whitespace-nowrap',
    padding,
    gap,
    radiusClass[radius],
    toneClass[tone],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const iconLeft = decorativeIcon && iconPosition === 'left'
  const iconRight = decorativeIcon && iconPosition === 'right'

  return (
    <span className={classes} {...rest}>
      {iconLeft ? <Icon name={decorativeIcon} size={iconSize} decorative className="shrink-0" /> : null}
      <Text as="span" variant={text} className="shrink-0 whitespace-nowrap">
        {children}
      </Text>
      {iconRight ? <Icon name={decorativeIcon} size={iconSize} decorative className="shrink-0" /> : null}
      {onRemove ? (
        <button
          type="button"
          className={removeButtonClass}
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <Icon name="x" size={iconSize} decorative />
        </button>
      ) : null}
    </span>
  )
}
