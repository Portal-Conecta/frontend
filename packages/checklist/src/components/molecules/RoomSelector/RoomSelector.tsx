'use client'

import { Input, Text } from '@portal/ui'
import { useState } from 'react'
import { RoomListItem } from '../../atoms/RoomListItem'

export interface Room {
    id: string
    number: string | number
    name: string
}

export interface RoomSelectorProps {
    rooms: Room[]
    onSelect: (room: Room) => void
    className?: string
}

export function RoomSelector({rooms, onSelect, className}: RoomSelectorProps) {
    const [search, setSearch] = useState('')

    const filtered = rooms.filter(
        (r) =>
            r.name.toLowerCase().includes(search.toLocaleLowerCase()) ||
        String(r.number).includes(search),
    )

    return (
        
    <div 
        style={{ gap: 'clamp(24px, 4vw, 40px)' }}
        className={[
            'flex flex-col items-center px-4 py-12 md:px-8',
            className,
        ]
        .filter(Boolean)
        .join(' ')}
    >
        <Text variant="heading-h2" tone="brand" className="text-center font-bold text-[clamp(24px,4vw,36px)]"
        >
            Selecione a Sala para Preencher o Checklist
        </Text>

        <div className="w-full max-w-[974px]">
            <Input
                placeholder=""
                iconRight='search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar Sala"
            />

            <div className="mt-2 text-placeholder">
                {filtered.map((room) => (
                    <RoomListItem
                        key={room.id}
                        number={room.number}
                        name={room.name}
                        onClick={() => onSelect(room)}
                        />
                ))}
            </div>
        </div>
    </div>
    )
}