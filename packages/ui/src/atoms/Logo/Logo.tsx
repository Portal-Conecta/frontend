/**
 * Logo — marca do Portal Conecta. Espelha o componente "Logo" do DS:
 * variant (full | mark) × tone (brand | inverse). A cor vem de token — o vetor
 * usa currentColor e o componente aplica a classe semântica.
 */

import type { ComponentPropsWithoutRef } from 'react'

import { LogoFullGlyph, LogoMarkGlyph } from './logo-glyphs'

/** `full` = símbolo + wordmark; `mark` = só o símbolo (resumida/colapsada). */
export type LogoVariant = 'full' | 'mark'

/** `brand` = azul (fundo claro); `inverse` = branco (fundo escuro). */
export type LogoTone = 'brand' | 'inverse'

export interface LogoProps
  extends Omit<ComponentPropsWithoutRef<'svg'>, 'color' | 'width' | 'height'> {
  /** Versão da marca. Default `full`. */
  variant?: LogoVariant
  /** Tom de cor, derivado de token. Default `brand`. */
  tone?: LogoTone
  /** Altura em px (largura deriva da proporção do vetor). DS: 16 · 24 · 32 · 54. Default 54. */
  size?: number
  /** Nome acessível da marca. Default "Portal Conecta". Ignorado se `decorative`. */
  title?: string
  /** Quando a logo é puramente decorativa (oculta de leitores de tela). */
  decorative?: boolean
}

const toneClass: Record<LogoTone, string> = {
  brand: 'text-text-brand',
  inverse: 'text-text-inverse',
}

export function Logo({
  variant = 'full',
  tone = 'brand',
  size = 54,
  title = 'Portal Conecta',
  decorative = false,
  className,
  ...rest
}: LogoProps) {
  const Glyph = variant === 'full' ? LogoFullGlyph : LogoMarkGlyph

  const a11yProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': title } as const)

  const classes = className ? `${toneClass[tone]} ${className}` : toneClass[tone]

  return <Glyph height={size} className={classes} {...a11yProps} {...rest} />
}
