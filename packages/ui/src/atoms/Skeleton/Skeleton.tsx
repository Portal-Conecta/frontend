import type { CSSProperties } from 'react'

import { spacing } from '../../tokens'

export type SkeletonVariant = 'text' | 'circle' | 'rect'

const variantRadius: Record<SkeletonVariant, string> = {
  text: 'rounded-sm',
  circle: 'rounded-full',
  rect: 'rounded-md',
}

// Defaults ancorados na escala de `spacing` do DS (múltiplos de 4px). `width: '100%'`
// é "preencher o container", não um valor de escala — fica como está.
const fallbackSize: Record<SkeletonVariant, { width: string | number; height: string | number }> = {
  text: { width: '100%', height: spacing[4] }, // 16px
  circle: { width: spacing[8], height: spacing[8] }, // 32px
  rect: { width: '100%', height: spacing[30] }, // 120px
}

export interface SkeletonProps {
  /** Forma do placeholder. Default `text`. */
  variant?: SkeletonVariant
  /** Largura (número = px). Default por variant. */
  width?: number | string
  /** Altura (número = px). Default por variant. */
  height?: number | string
  /**
   * Quantas linhas renderizar (só `variant="text"`). Default `1`. Com mais de uma,
   * a última sai mais curta — leitura típica de parágrafo carregando.
   */
  count?: number
  className?: string
}

const toCss = (value: number | string): string => (typeof value === 'number' ? `${value}px` : value)

function Bar({ variant, style, className }: { variant: SkeletonVariant; style: CSSProperties; className?: string }) {
  const classes = [
    'block animate-pulse bg-border-default motion-reduce:animate-none',
    variantRadius[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span aria-hidden="true" className={classes} style={style} />
}

export function Skeleton({ variant = 'text', width, height, count = 1, className }: SkeletonProps) {
  const size = fallbackSize[variant]
  const style: CSSProperties = {
    width: toCss(width ?? size.width),
    height: toCss(height ?? size.height),
  }

  if (variant === 'text' && count > 1) {
    return (
      <span aria-hidden="true" className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
        {Array.from({ length: count }, (_, i) => (
          <Bar
            key={i}
            variant="text"
            // última linha mais curta (75%), salvo override explícito de width
            style={i === count - 1 && width === undefined ? { ...style, width: '75%' } : style}
          />
        ))}
      </span>
    )
  }

  return <Bar variant={variant} style={style} {...(className ? { className } : {})} />
}
