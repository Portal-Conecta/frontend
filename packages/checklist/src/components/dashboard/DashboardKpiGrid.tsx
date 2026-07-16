'use client'

import { Icon, Skeleton, Text, type IconName } from '@portal/ui'

import { DASHBOARD_KPIS } from './dashboardDemoData'

const toneIcon: Record<(typeof DASHBOARD_KPIS)[number]['tone'], string> = {
  positive: 'text-feedback-success',
  brand: 'text-text-brand',
  negative: 'text-feedback-error',
}

export interface DashboardKpiGridProps {
  loading?: boolean
}

export function DashboardKpiGrid({ loading = false }: DashboardKpiGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-default bg-background-surface p-5"
          >
            <Skeleton variant="text" count={2} />
            <Skeleton variant="rect" height={40} className="mt-4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {DASHBOARD_KPIS.map((kpi) => (
        <article
          key={kpi.id}
          className="flex flex-col gap-3 rounded-md border border-border-default bg-background-surface p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Text as="h2" variant="label-sm" tone="secondary">
              {kpi.label}
            </Text>
            <span
              className={[
                'flex h-9 w-9 items-center justify-center rounded-sm bg-background-default',
                toneIcon[kpi.tone],
              ].join(' ')}
              aria-hidden
            >
              <Icon name={kpi.icon as IconName} size="sm" />
            </span>
          </div>
          <Text as="p" variant="heading-h1" tone="primary" className="tracking-tight">
            {kpi.value}
          </Text>
          <Text variant="body-sm" tone="secondary">
            {kpi.hint}
          </Text>
        </article>
      ))}
    </div>
  )
}
