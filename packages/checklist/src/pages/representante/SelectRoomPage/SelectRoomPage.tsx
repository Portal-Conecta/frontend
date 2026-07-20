"use client";

import { Text } from "@portal/ui";

import { RoomSelector } from "../../../components/RoomSelector";
import { useAvailableRooms } from "../../../hooks/useAvailableRooms";

export interface SelectRoomPageProps {
  onRoomSelected: (params: { roomId: string; roomLabel: string }) => void;
}

export function SelectRoomPage({ onRoomSelected }: SelectRoomPageProps) {
  const { rooms, loading, error } = useAvailableRooms();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          Carregando...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          {error}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <RoomSelector
        rooms={rooms}
        onSelect={(room) => {
          onRoomSelected({ roomId: room.id, roomLabel: `${room.number}` });
        }}
      />
    </div>
  );
}
