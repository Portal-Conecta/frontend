'use client'

import Link from 'next/link'

import { Button, Text } from '@portal/ui'

export interface ComunicadosEmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function ComunicadosEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: ComunicadosEmptyStateProps) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center text-center">
      <div className="relative h-44 w-44" aria-hidden="true">
        <div className="absolute left-8 top-2 flex h-32 w-24 items-center justify-center rounded-md border-sm border-border-default bg-interactive-disabled shadow-sm">
          <Text as="span" variant="heading-h2" tone="primary">
            :(
          </Text>
        </div>

        <div className="absolute bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-sm bg-feedback-info text-text-inverse">
          <Text as="span" variant="heading-h2" tone="inverse">
            !
          </Text>
        </div>
      </div>

      <Text as="h2" variant="label-md-emphasis" tone="brand">
        {title}
      </Text>

      <Text as="p" variant="body-sm" tone="secondary" className="mt-1 max-w-md">
        {description}
      </Text>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-interactive-default px-4 py-2 text-label-md-emphasis font-inter text-text-inverse hover:bg-interactive-hover active:bg-interactive-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
        >
          {actionLabel}
        </Link>
      ) : actionLabel ? (
        <Button variant="outlined" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
