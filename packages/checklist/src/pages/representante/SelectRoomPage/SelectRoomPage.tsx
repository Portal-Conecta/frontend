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
      <div className="h-full overflow-y-auto">
        <div className="flex min-h-full items-center justify-center py-6">
          <div className="flex flex-col items-center gap-6 px-3 md:gap-10 md:px-8">
            <Skeleton variant="text" width={340} height={36} />

            <div className="w-full max-w-5xl">
              <Skeleton variant="rect" height={44} />

              <ul className="mt-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 border-b border-border-default p-4"
                  >
                    <Skeleton variant="text" width={32} />
                    <Skeleton variant="text" width={160} />
                  </li>
                ))}
              </ul>
            </div>
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
    <div className="h-full w-full overflow-hidden">
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
  );
}
