'use client'

import { SelectRoomPage } from '@portal/checklist'
import { useRouter } from 'next/navigation'

const rooms = [
    { id: '204', number: 204, name: 'Laboratório de informática' },
    { id: '203', number: 203, name: 'Laboratório de informática' },
    { id: '202', number: 202, name: 'Laboratório de informática' },
    { id: '201', number: 201, name: 'Laboratório de informática' },
]

export default function SelecionarSalaRoute() {
    const router = useRouter()

    return (
        <SelectRoomPage
            rooms={rooms}
            onSelectRoom={(room) => router.push(`/checklist/preencher/${room.id}`)}
        />
    )
}