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
      <div className="h-full w-full overflow-hidden">
        <div className="flex h-full max-h-full w-full flex-col items-center pt-14 md:pt-10 px-3 md:px-8">
          {/* 1. Cabeçalho + Busca */}
          <div className="flex w-full max-w-2xl flex-col items-center gap-6 pb-6 md:gap-8 flex-shrink-0">
            <Skeleton variant="text" width={340} height={36} className="mb-4" />
            <Skeleton variant="rect" height={44} className="w-full mb-4" />
          </div>

          {/* 2. Apenas a lista rola */}
          <div className="w-full max-w-2xl flex-1 overflow-y-auto pb-6">
            <ul className="mt-2 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 border-b border-border-default p-4"
                >
                  <Skeleton variant="text" width={32} className="shrink-0" />
                  <Skeleton variant="text" width={160} />
                </li>
              ))}
            </ul>
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
