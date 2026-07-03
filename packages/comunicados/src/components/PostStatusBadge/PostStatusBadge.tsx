import type { HTMLAttributes } from 'react'

import { Icon, Text, type IconName } from '@portal/ui'

import type { AnnouncementStatus } from '../../types'

interface StatusBadgeConfig {
  label: string
  icon: IconName
  className: string
  barClassName: string
  iconClassName: string
  textClassName: string
}

const statusConfig: Record<AnnouncementStatus, StatusBadgeConfig> = {
  PUBLISHED: {
    label: 'Publicado',
    icon: 'check-check',
    className: 'bg-interactive-positive-subtle',
    barClassName: 'bg-interactive-positive-default',
    iconClassName: 'bg-interactive-positive-default text-text-inverse',
    textClassName: 'text-interactive-positive-default',
  },
  SCHEDULED: {
    label: 'Agendado',
    icon: 'bell',
    className: 'bg-feedback-warning/20',
    barClassName: 'bg-feedback-warning',
    iconClassName: 'bg-feedback-warning text-text-primary',
    textClassName: 'text-feedback-warning',
  },
  REMOVED: {
    label: 'Removido',
    icon: 'x',
    className: 'bg-interactive-negative-subtle',
    barClassName: 'bg-interactive-negative-default',
    iconClassName: 'bg-interactive-negative-default text-text-inverse',
    textClassName: 'text-interactive-negative-default',
  },
}

export interface PostStatusBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  status: AnnouncementStatus
}

export function PostStatusBadge({ status, className, ...rest }: PostStatusBadgeProps) {
  const config = statusConfig[status]

  const classes = [
    'relative flex w-full max-w-full shrink-0 items-center gap-4 overflow-hidden rounded-md px-4 py-4',
    config.className,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      <span className={['absolute left-0 top-0 h-full w-2', config.barClassName].join(' ')} aria-hidden="true" />
      <span
        className={[
          'ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
          config.iconClassName,
        ].join(' ')}
        aria-hidden="true"
      >
        <Icon name={config.icon} size="md" decorative />
      </span>
      <Text as="span" variant="label-xl-emphasis" className={['min-w-0 flex-1 truncate', config.textClassName].join(' ')}>
        {config.label}
      </Text>
      <Icon name="x" size="md" decorative className={['shrink-0', config.textClassName].join(' ')} />
    </div>
  )
}
