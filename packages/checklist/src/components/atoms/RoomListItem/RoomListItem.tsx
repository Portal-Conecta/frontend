'use client'

import { Text } from '@portal/ui'

export interface RoomListItemProps {
    number: string | number
    name: string
    onClick?: () => void
    className?: string
}

export function RoomListItem({number, name, onClick, className}: RoomListItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex w-full items-center gap-3 border-b border-border-default py-4 text-left',
                'hover:bg-background-default transition-colors',
                className,
            ]
        .filter(Boolean)
        .join(' ')}
        >
            <Text variant="body-sm" tone="secondary" className="w-8 shrink-0 font-inter">
                {number}
            </Text>
            <Text variant="body-sm" tone="secondary" className="font-inter">
                {name}
            </Text>
        </button>
    )
}