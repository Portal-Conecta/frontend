import type { HTMLAttributes } from 'react'

import { Text } from '@portal/ui'

import type { AnnouncementStatus } from '../../../types'

interface StatusBadgeConfig {
  label: string
  className: string
}

const statusConfig: Record<AnnouncementStatus, StatusBadgeConfig> = {
  PUBLISHED: {
    label: 'Publicado',
    className: 'bg-feedback-success text-text-primary',
  },
  SCHEDULED: {
    label: 'Agendado',
    className: 'bg-feedback-warning text-text-primary',
  },
}

export interface PostStatusBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: AnnouncementStatus
}

export function PostStatusBadge({ status, className, ...rest }: PostStatusBadgeProps) {
  const config = statusConfig[status]

  const classes = [
    'inline-flex w-fit max-w-full shrink-0 items-center rounded-full px-3 py-2 whitespace-nowrap',
    config.className,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      <Text as="span" variant="label-xs" className="shrink-0 whitespace-nowrap">
        {config.label}
      </Text>
    </span>
  )
}
