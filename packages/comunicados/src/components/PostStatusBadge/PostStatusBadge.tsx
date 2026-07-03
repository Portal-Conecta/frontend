import type { CSSProperties, HTMLAttributes } from 'react'

import { Icon, Text, type IconName } from '@portal/ui'

import type { AnnouncementStatus } from '../../types'

interface StatusBadgeConfig {
  label: string
  icon: IconName
  containerStyle?: CSSProperties
  barClassName: string
  iconClassName: string
  textClassName: string
  textStyle?: CSSProperties
}

const statusConfig: Record<AnnouncementStatus, StatusBadgeConfig> = {
  PUBLISHED: {
    label: 'Publicado',
    icon: 'check-check',
    containerStyle: { backgroundColor: '#d8f5d9' },
    barClassName: 'bg-interactive-positive-default',
    iconClassName: 'bg-interactive-positive-default text-text-inverse rounded-full',
    textClassName: 'text-interactive-positive-default',
  },
  SCHEDULED: {
    label: 'Agendado',
    icon: 'bell',
    containerStyle: { backgroundColor: '#f9f8d9' },
    barClassName: 'bg-feedback-warning',
    iconClassName: 'text-feedback-warning',
    textClassName: '',
    textStyle: { color: '#adad22' },
  },
  REMOVED: {
    label: 'Removido',
    icon: 'x',
    barClassName: 'bg-interactive-negative-default',
    iconClassName: 'bg-interactive-negative-default text-text-inverse rounded-full',
    textClassName: 'text-interactive-negative-default',
  },
}

export interface PostStatusBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  status: AnnouncementStatus
}

export function PostStatusBadge({ status, className, style, ...rest }: PostStatusBadgeProps) {
  const config = statusConfig[status]

  const classes = [
    'relative flex h-[47px] w-[290px] max-w-full shrink-0 items-center overflow-hidden rounded-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} style={{ ...config.containerStyle, ...style }} {...rest}>
      <span
        className={['absolute left-0 top-0 h-full w-[5px] rounded-sm', config.barClassName].join(' ')}
        aria-hidden="true"
      />
      <span
        className={[
          'flex h-6 w-6 shrink-0 items-center justify-center',
          config.iconClassName,
        ].join(' ')}
        style={{ marginLeft: 10 }}
        aria-hidden="true"
      >
        <Icon name={config.icon} size={status === 'SCHEDULED' ? 'md' : 'sm'} decorative />
      </span>
      <Text
        as="span"
        variant="label-sm-emphasis"
        className={['ml-2 min-w-0 flex-1 truncate', config.textClassName].filter(Boolean).join(' ')}
        style={config.textStyle}
      >
        {config.label}
      </Text>
      <Icon
        name="x"
        size="sm"
        decorative
        className={['shrink-0', config.textClassName].filter(Boolean).join(' ')}
        style={{ marginRight: 17, ...config.textStyle }}
      />
    </div>
  )
}
