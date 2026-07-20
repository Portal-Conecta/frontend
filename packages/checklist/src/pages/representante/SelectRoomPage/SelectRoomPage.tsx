"use client";

import { Text } from "@portal/ui";

import { RoomSelector } from "../../../components/RoomSelector";
import { useAvailableRooms } from "../../../hooks/useAvailableRooms";

export interface SelectRoomPageProps {
  onRoomSelected: (params: { templateId: string; roomId: string }) => void;
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
          const selected = rooms.find((r) => r.id === room.id);
          if (!selected) return;
          onRoomSelected({ templateId: selected.templateId, roomId: selected.id });
        }}
      />
    </div>
  );
}
