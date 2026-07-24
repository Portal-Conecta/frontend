"use client";

import { Input, Text } from "@portal/ui";
import { useMemo, useState } from "react";

import { RoomListItem } from "../RoomListItem/RoomListItem";

export interface Room {
  id: string;
  number: string | number;
  name: string;
}

export interface RoomSelectorProps {
  rooms: Room[];
  onSelect: (room: Room) => void;
  className?: string;
}

export function RoomSelector({
  rooms,
  onSelect,
  className,
}: RoomSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rooms;
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        String(r.number).includes(query),
    );
  }, [rooms, search]);

  return (
    <div
      className={[
        "flex h-full max-h-full w-full flex-col items-center pt-18 md:pt-14 px-3 md:px-8 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 1. Cabeçalho + Busca */}
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 pb-6 md:gap-8 flex-shrink-0">
        <Text as="h1" variant="heading-h2" tone="brand" className="text-center">
          Selecione a Sala para Preencher o Checklist
        </Text>

        <div className="w-full">
          <Input
            iconRight="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar Sala"
          />
        </div>
      </div>

      {/* 2. Apenas a lista rola */}
      <div
        className="w-full max-w-2xl flex-1 overflow-y-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-live="polite"
      >
        {filtered.length > 0 ? (
          <ul role="list" className="mt-2">
            {filtered.map((room) => (
              <li key={room.id}>
                <RoomListItem
                  number={room.number}
                  name={room.name}
                  onClick={() => onSelect(room)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Text variant="body-sm" tone="secondary" className="mt-4 text-center">
            Nenhuma sala encontrada.
          </Text>
        )}
      </div>
    </div>
  );
}
