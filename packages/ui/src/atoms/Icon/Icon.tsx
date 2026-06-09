/**
 * Icon — wrapper único sobre os ícones do Lucide, impondo as regras do DS
 * (Figma GPvf4G2qpP8MMyK3HB6n2t, página "Iconography"):
 *
 *  ① stroke 2px fixo  → `strokeWidth` travado, não é prop.
 *  ② tamanhos 16/24/32 → `size` = sm | md | lg (nada de 18/20/…).
 *  ③ cor via token     → `currentColor` + `tone` (token semântico).
 *  ④ sempre quadrado + acessível.
 *
 * Qual ícone vem do registry curado (`icons.ts`) — `name` é um union tipado,
 * então só o set aprovado pelo DS compila.
 */
import type { LucideProps } from 'lucide-react'

import { iconRegistry, type IconName } from './icons'

export type { IconName }

export type IconSize = 'sm' | 'md' | 'lg'

/** Cor semântica do ícone. Omitido = herda `currentColor` do contexto. */
export type IconTone = 'primary' | 'secondary' | 'inverse'

const sizePx: Record<IconSize, number> = { sm: 16, md: 24, lg: 32 }

const toneClass: Record<IconTone, string> = {
  primary: 'text-interactive-default',
  secondary: 'text-text-secondary',
  inverse: 'text-text-inverse',
}

export interface IconProps
  extends Omit<LucideProps, 'ref' | 'size' | 'strokeWidth' | 'color'> {
  /** Ícone do set aprovado pelo DS. */
  name: IconName
  /** Tamanho: sm=16 · md=24 · lg=32. Default md. */
  size?: IconSize
  /** Cor semântica. Omitir para herdar a cor do contexto (currentColor). */
  tone?: IconTone
  /** Nome acessível. Default: o próprio `name`. Ignorado se `decorative`. */
  label?: string
  /** Ícone puramente decorativo (oculto de leitores de tela). */
  decorative?: boolean
}

export function Icon({
  name,
  size = 'md',
  tone,
  label,
  decorative = false,
  className,
  ...rest
}: IconProps) {
  const Glyph = iconRegistry[name]

  const classes =
    [tone ? toneClass[tone] : undefined, name === 'loading-circle' ? 'animate-spin' : undefined, className]
      .filter(Boolean)
      .join(' ') || undefined

  const a11yProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': label ?? name } as const)

  return (
    <Glyph size={sizePx[size]} strokeWidth={2} className={classes} {...a11yProps} {...rest} />
  )
}
