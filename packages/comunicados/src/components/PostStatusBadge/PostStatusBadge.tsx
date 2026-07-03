import type { CSSProperties, HTMLAttributes } from 'react'

import { Icon, Text, type IconName } from '@portal/ui'

import type { AnnouncementStatus } from '../../types'

type PostStatusBadgeStatus = Extract<AnnouncementStatus, 'PUBLISHED' | 'SCHEDULED'>

interface StatusBadgeConfig {
  label: string
  icon: IconName
  containerStyle?: CSSProperties
  barClassName: string
  iconClassName: string
  textClassName: string
  textStyle?: CSSProperties
}

const statusConfig: Record<PostStatusBadgeStatus, StatusBadgeConfig> = {
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
}

export interface PostStatusBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  status: PostStatusBadgeStatus
}

export function PostStatusBadge({ status, className, style, ...rest }: PostStatusBadgeProps) {
  const config = statusConfig[status]

  const classes = [
    'relative flex shrink-0 items-center overflow-hidden rounded-full',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={{
        ...config.containerStyle,
        ...style,
        width: 47,
        height: 25,
        flex: '0 0 47px',
      }}
      {...rest}
    >
      <span
        className={['absolute left-0 top-0 h-full w-[5px] rounded-full', config.barClassName].join(' ')}
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
