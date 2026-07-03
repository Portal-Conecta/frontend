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
    iconClassName: 'bg-interactive-positive-default text-text-inverse rounded-full',
    textClassName: 'text-interactive-positive-default',
  },
  SCHEDULED: {
    label: 'Agendado',
    icon: 'bell',
    className: 'bg-feedback-warning/15',
    barClassName: 'bg-feedback-warning',
    iconClassName: 'text-feedback-warning',
    textClassName: 'text-text-secondary',
  },
  REMOVED: {
    label: 'Removido',
    icon: 'x',
    className: 'bg-interactive-negative-subtle',
    barClassName: 'bg-interactive-negative-default',
    iconClassName: 'bg-interactive-negative-default text-text-inverse rounded-full',
    textClassName: 'text-interactive-negative-default',
  },
}

export interface PostStatusBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  status: AnnouncementStatus
}

export function PostStatusBadge({ status, className, ...rest }: PostStatusBadgeProps) {
  const config = statusConfig[status]

  const classes = [
    'relative flex h-[47px] w-[290px] max-w-full shrink-0 items-center overflow-hidden rounded-md',
    config.className,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      <span className={['absolute left-0 top-0 h-full w-[5px]', config.barClassName].join(' ')} aria-hidden="true" />
      <span
        className={[
          'ml-2 flex h-6 w-6 shrink-0 items-center justify-center',
          config.iconClassName,
        ].join(' ')}
        aria-hidden="true"
      >
        <Icon name={config.icon} size={status === 'SCHEDULED' ? 'md' : 'sm'} decorative />
      </span>
      <Text as="span" variant="label-sm-emphasis" className={['ml-2 min-w-0 flex-1 truncate', config.textClassName].join(' ')}>
        {config.label}
      </Text>
      <Icon name="x" size="sm" decorative className={['mr-4 shrink-0', config.textClassName].join(' ')} />
    </div>
  )
}
