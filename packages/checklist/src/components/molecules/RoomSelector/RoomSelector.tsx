"use client";

import { Input, Text } from "@portal/ui";
import { useState } from "react";

import { RoomListItem } from "../../atoms/RoomListItem/RoomListItem";

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

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      String(r.number).includes(search),
  );

  return (
    <div
      className={[
        "flex min-h-screen flex-col items-center justify-center gap-6 px-4 md:gap-10 md:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text variant="heading-h2" tone="brand" className="text-center">
        Selecione a Sala para Preencher o Checklist
      </Text>

      <div className="w-full max-w-[974px]">
        <Input
          iconRight="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar Sala"
        />

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
