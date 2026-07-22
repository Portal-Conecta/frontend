"use client";

import { Skeleton } from "@portal/ui";

import { ChecklistErrorState } from "../../../components/ChecklistErrorState";
import { RoomSelector } from "../../../components/RoomSelector";
import { useAvailableRooms } from "../../../hooks/useAvailableRooms";

export interface SelectRoomPageProps {
  onRoomSelected: (params: { roomId: string; roomLabel: string }) => void;
}

export function SelectRoomPage({ onRoomSelected }: SelectRoomPageProps) {
  const { rooms, loading, error, retry } = useAvailableRooms();

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center gap-6 px-3 pt-6 md:gap-10 md:px-8">
        <Skeleton variant="text" width={340} height={28} />
        <div className="w-full max-w-5xl">
          <Skeleton variant="rect" height={40} />
          <div className="mt-2 flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rect" height={56} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <ChecklistErrorState description={error} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full items-center justify-center py-6">
        <RoomSelector
          rooms={rooms}
          onSelect={(room) => {
            onRoomSelected({
              roomId: room.id,
              roomLabel: `${room.number} - ${room.name}`,
            });
          }}
        />
      </div>
    </div>
  );
}
