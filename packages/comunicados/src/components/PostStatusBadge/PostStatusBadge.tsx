import type { HTMLAttributes } from 'react'

import { Icon, Text, type IconName } from '@portal/ui'

import type { AnnouncementStatus } from '../../types'

interface StatusBadgeConfig {
  label: string
  icon: IconName
  iconClassName: string
  textClassName: string
}

const statusConfig: Record<AnnouncementStatus, StatusBadgeConfig> = {
  PUBLISHED: {
    label: 'Publicado',
    icon: 'check-check',
    iconClassName: 'bg-interactive-positive-default text-text-inverse',
    textClassName: 'text-interactive-positive-default',
  },
  SCHEDULED: {
    label: 'Agendado',
    icon: 'bell',
    iconClassName: 'bg-feedback-warning text-text-primary',
    textClassName: 'text-text-primary',
  },
  REMOVED: {
    label: 'Removido',
    icon: 'x',
    iconClassName: 'bg-interactive-negative-default text-text-inverse',
    textClassName: 'text-interactive-negative-default',
  },
}

export interface PostStatusBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: AnnouncementStatus
}

export function PostStatusBadge({ status, className, ...rest }: PostStatusBadgeProps) {
  const config = statusConfig[status]

  const classes = [
    'inline-flex w-fit max-w-full shrink-0 items-center gap-4 whitespace-nowrap',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      <span
        className={[
          'flex h-12 w-6 shrink-0 items-center justify-center rounded-full',
          config.iconClassName,
        ].join(' ')}
        aria-hidden="true"
      >
        <Icon name={config.icon} size="md" decorative />
      </span>
      <Text as="span" variant="label-xl-emphasis" className={['min-w-0 truncate', config.textClassName].join(' ')}>
        {config.label}
      </Text>
    </span>
  )
}
