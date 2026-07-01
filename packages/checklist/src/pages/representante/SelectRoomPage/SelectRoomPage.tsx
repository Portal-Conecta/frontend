'use client'

import { RoomSelector, type Room } from '../../../components/molecules/RoomSelector'

export interface SelectRoomPageProps {
  rooms: Room[]
  onSelectRoom: (room: Room) => void
}

export function SelectRoomPage({ rooms, onSelectRoom }: SelectRoomPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <RoomSelector rooms={rooms} onSelect={onSelectRoom} />
    </div>
  )
}