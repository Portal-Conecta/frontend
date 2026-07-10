'use client'

import { Text } from '@portal/ui'

export interface RoomListItemProps {
  number: string | number
  name: string
  onClick?: () => void
  className?: string
}

export function RoomListItem({ number, name, onClick, className }: RoomListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 border-b border-border-default py-4 text-left',
        'transition-colors hover:bg-background-default',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Text variant="label-sm" tone="secondary" className="w-8 shrink-0">
        {number}
      </Text>
      <Text variant="label-sm" tone="secondary">
        {name}
      </Text>
    </button>
  )
}