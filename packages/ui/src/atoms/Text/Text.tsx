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

// ---------------------------------------------------------------------------
// 1) Mapa variant → classes literais.
//
// IMPORTANTE: as classes precisam ser strings LITERAIS. O Tailwind escaneia o
// código procurando os nomes de classe como texto; se a gente montasse
// `text-${variant}` dinamicamente, ele não geraria o CSS. Por isso cada
// variante tem sua string completa (tamanho + família juntos).
//
// Os nomes espelham os tokens de `tokens/typography.ts`.
// ---------------------------------------------------------------------------
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

/** Variantes de tipografia disponíveis (derivado do mapa acima). */
export type TextVariant = keyof typeof variantClass

/** Lista das variantes — útil para iterar (ex: galeria no Storybook). */
export const textVariants = Object.keys(variantClass) as TextVariant[]

// ---------------------------------------------------------------------------
// 2) Mapa tone → classe de cor (camada semântica de cor dos tokens).
// ---------------------------------------------------------------------------
export type TextTone = 'primary' | 'secondary' | 'brand' | 'inverse' | 'disabled'

const toneClass: Record<TextTone, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  brand: 'text-text-brand',
  inverse: 'text-text-inverse',
  disabled: 'text-text-disabled',
}

// ---------------------------------------------------------------------------
// 3) Quais tags o Text pode renderizar. Aparência (variant) é independente da
//    semântica (a tag). Ex: um texto grande pode ser <h1> OU só um <span>.
// ---------------------------------------------------------------------------
export type TextElement = 'p' | 'span' | 'label' | 'div' | 'h1' | 'h2' | 'h3'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Estilo tipográfico (token). Default `body-md`. */
  variant?: TextVariant
  /** Tag HTML renderizada. Default `p`. */
  as?: TextElement
  /** Cor semântica. Omitir = herda a cor do contexto (currentColor). */
  tone?: TextTone
  children: ReactNode
}

// ---------------------------------------------------------------------------
// 4) O componente: junta variant + tone + className e renderiza a tag.
// ---------------------------------------------------------------------------
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
