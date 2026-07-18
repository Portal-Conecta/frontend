import type { HTMLAttributes, ReactNode } from 'react'

import { Text } from '../../atoms/Text'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  /** Visual contextual fornecido pelo consumidor; o DS controla apenas sua posição na composição. */
  illustration?: ReactNode
  /**
   * Ação pronta para renderização, como `Button` ou `Link`.
   * O slot mantém `@portal/ui` independente do roteador da aplicação e evita
   * combinações inválidas entre `actionHref`, `actionLabel` e `onAction`.
   */
  action?: ReactNode
}

export function EmptyState({ title, description, illustration, action, className, ...rest }: EmptyStateProps) {
  const classes = ['flex min-h-96 flex-col items-center justify-center text-center', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      {illustration}

      <Text as="h2" variant="label-md-emphasis" tone="brand">
        {title}
      </Text>

      <Text as="p" variant="body-sm" tone="secondary" className="mt-1 max-w-md">
        {description}
      </Text>

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
