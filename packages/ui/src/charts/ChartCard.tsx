'use client'

import type { CSSProperties, ReactNode } from 'react'

import { Skeleton, Text } from '../atoms'

export interface ChartCardProps {
  title: string
  /** Altura da área do gráfico (px). Default 280. */
  height?: number
  /** Ação à direita do título (filtro, export, etc.). */
  action?: ReactNode
  /** Estado de carregamento — skeleton do DS. */
  loading?: boolean
  /** Sem dados — mensagem de vazio. */
  empty?: boolean
  emptyMessage?: string
  className?: string
  children: ReactNode
}

/**
 * Container de gráfico no Design System: card + título (Text) + loading/vazio.
 * O filho deve ser o Chart.js (via react-chartjs-2) já configurado com
 * {@link makeDsChartOptions}.
 */
export function ChartCard({
  title,
  height = 280,
  action,
  loading = false,
  empty = false,
  emptyMessage = 'Sem dados para o período selecionado.',
  className,
  children,
}: ChartCardProps) {
  const rootClass = [
    'flex flex-col gap-3 rounded-md border border-border-default bg-background-surface p-4',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const chartAreaStyle: CSSProperties = {
    height,
    minHeight: height,
    position: 'relative',
    width: '100%',
  }

  return (
    <section className={rootClass} aria-label={title}>
      <header className="flex items-start justify-between gap-3">
        <Text as="h3" variant="label-md-emphasis" tone="primary">
          {title}
        </Text>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <div style={chartAreaStyle}>
        {loading ? (
          <div className="flex h-full flex-col justify-end gap-2" role="status" aria-live="polite" aria-busy="true">
            <span className="sr-only">Carregando gráfico</span>
            <Skeleton variant="rect" height={height - 48} className="w-full" />
            <Skeleton variant="text" count={2} />
          </div>
        ) : empty ? (
          <div
            className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center"
            role="status"
          >
            <Text variant="body-sm" tone="secondary">
              {emptyMessage}
            </Text>
          </div>
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </div>
    </section>
  )
}
