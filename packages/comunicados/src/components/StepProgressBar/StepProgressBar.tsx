export interface StepProgressBarProps {
  /** Número total de etapas. */
  totalSteps: number
  /**
   * Índice da etapa atual (0-based).
   * Etapas até esta (inclusive) são exibidas preenchidas em azul.
   */
  currentStep: number
  /** Rótulos de cada etapa — usados só para acessibilidade. */
  labels?: readonly string[]
  className?: string
}

/**
 * StepProgressBar — indicador segmentado de progresso em wizard.
 *
 * Uma barra fina por etapa, com espaçamento entre segmentos. Segmentos concluídos
 * ou ativos usam `interactive-default`; pendentes usam `border-default`.
 */
export function StepProgressBar({
  totalSteps,
  currentStep,
  labels,
  className,
}: StepProgressBarProps) {
  const safeTotal = Math.max(1, totalSteps)
  const safeCurrent = Math.min(Math.max(0, currentStep), safeTotal - 1)

  const classes = ['flex w-full gap-2 mt-6', className].filter(Boolean).join(' ')

  return (
    <nav aria-label="Progresso do formulário" className={classes}>
      <ol className="flex w-full list-none gap-2 p-0 m-0">
        {Array.from({ length: safeTotal }, (_, index) => {
          const filled = index <= safeCurrent
          const label = labels?.[index] ?? `Etapa ${index + 1}`

          return (
            <li key={index} className="flex-1" aria-current={index === safeCurrent ? 'step' : undefined}>
              <div
                role="presentation"
                aria-label={`${label}${filled ? ' — concluída ou em andamento' : ' — pendente'}`}
                className={
                  'h-1 w-full ' + (filled ? 'bg-interactive-default' : 'bg-border-default')
                }
              />
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
