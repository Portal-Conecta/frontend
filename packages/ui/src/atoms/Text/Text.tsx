/**
 * Text — primitivo de tipografia.
 *
 * Não há componente de Text no DS (tipografia vive como token). Este átomo é
 * uma camada fina por cima dos tokens: você escolhe a *intenção* (`variant`) e
 * ele aplica tamanho + entrelinhamento + peso + família corretos, sem você
 * precisar lembrar de parear `text-*` com `font-*`.
 *
 * Famílias (regra do DS): heading e label usam Inter; body usa Afacad.
 */
import type { HTMLAttributes, ReactNode } from 'react'

const variantClass = {
  'heading-h1': 'text-heading-h1 font-inter',
  'heading-h2': 'text-heading-h2 font-inter',
  'body-md': 'text-body-md font-afacad',
  'body-md-emphasis': 'text-body-md-emphasis font-afacad',
  'body-sm': 'text-body-sm font-afacad',
  'body-sm-emphasis': 'text-body-sm-emphasis font-afacad',
  'label-xl': 'text-label-xl font-inter',
  'label-xl-emphasis': 'text-label-xl-emphasis font-inter',
  'label-md': 'text-label-md font-inter',
  'label-md-emphasis': 'text-label-md-emphasis font-inter',
  'label-sm': 'text-label-sm font-inter',
  'label-sm-emphasis': 'text-label-sm-emphasis font-inter',
  'label-xs': 'text-label-xs font-inter',
} as const

export type TextVariant = keyof typeof variantClass

export const textVariants = Object.keys(variantClass) as TextVariant[]

export type TextTone = 'primary' | 'secondary' | 'brand' | 'inverse' | 'disabled'

const toneClass: Record<TextTone, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  brand: 'text-text-brand',
  inverse: 'text-text-inverse',
  disabled: 'text-text-disabled',
}

export type TextElement = 'p' | 'span' | 'label' | 'div' | 'h1' | 'h2' | 'h3' | 'a'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  as?: TextElement
  tone?: TextTone
  /** Para `as="label"`: associa o label a um input (atributo `for`). */
  htmlFor?: string
  /** Para `as="a"`: destino do link (atributo `href`). */
  href?: string
  children: ReactNode
}

export function Text({ variant = 'body-md', as = 'p', tone, className, children, ...rest }: TextProps) {
  const Tag = as

  const classes = [variantClass[variant], tone ? toneClass[tone] : undefined, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}
