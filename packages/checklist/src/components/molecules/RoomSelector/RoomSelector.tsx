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
        "flex w-full flex-col items-center gap-8 px-4 md:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text variant="heading-h2" tone="brand" className="text-center">
        Selecione a sala para preencher a checklist
      </Text>

      <div className="w-full max-w-4xl">
        <Input
          iconRight="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar sala"
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
