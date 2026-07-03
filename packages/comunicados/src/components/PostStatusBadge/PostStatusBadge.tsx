import type { CSSProperties, HTMLAttributes } from 'react'

import { Text } from '@portal/ui'

import type { AnnouncementStatus } from '../../types'

type PostStatusBadgeStatus = Extract<AnnouncementStatus, 'PUBLISHED' | 'SCHEDULED'>

interface StatusBadgeConfig {
  label: string
  containerStyle?: CSSProperties
  textClassName: string
  textStyle?: CSSProperties
}

const statusConfig: Record<PostStatusBadgeStatus, StatusBadgeConfig> = {
  PUBLISHED: {
    label: 'Publicado',
    containerStyle: { backgroundColor: '#d8f5d9' },
    textClassName: 'text-interactive-positive-default',
  },
  SCHEDULED: {
    label: 'Agendado',
    containerStyle: { backgroundColor: '#f9f8d9' },
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
        width: 300,
        height: 45,
        flex: '0 0 300px',
      }}
      {...rest}
    >
      <Text
        as="span"
        variant="label-sm-emphasis"
        className={['min-w-0 flex-1 truncate text-center', config.textClassName].filter(Boolean).join(' ')}
        style={config.textStyle}
      >
        {config.label}
      </Text>
    </div>
  )
}
