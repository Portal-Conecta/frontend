"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Banner, Input, Text } from "@portal/ui";

import { SectionTabs } from "../components/SectionTabs";
import { RoomChecklistItem } from "../components/RoomChecklistItem";
import type { MockChecklistRoom } from "./gestaoItensMockData";

export interface PageChecklistGestaoItensContentProps {
  initialRooms: MockChecklistRoom[];
  initialError?: boolean;
}

const CHECKLIST_TABS = [
  { label: "Preenchimento", href: "/checklist" },
  { label: "Não Conformidades", href: "/checklist/nao-conformidades" },
  { label: "Gestão de Itens", href: "/checklist/gestao-itens" },
];

export function PageChecklistGestaoItensContent({
  initialRooms,
  initialError = false,
}: PageChecklistGestaoItensContentProps) {
  const router = useRouter();

  const [rooms] = useState(initialRooms);
  const [search, setSearch] = useState("");
  const error = initialError;

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rooms;
    return rooms.filter((r) => r.room.toLowerCase().includes(query));
  }, [rooms, search]);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <SectionTabs tabs={CHECKLIST_TABS} />

      <Text as="h1" variant="heading-h2" tone="brand" className="sr-only">
        Gestão de Itens
      </Text>

      {error && (
        <Banner variant="error">
          Não foi possível carregar a lista de salas.
        </Banner>
      )}

      <Input
        iconRight="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Buscar Sala"
        placeholder="Buscar Sala"
      />

      <div aria-live="polite">
        {filteredRooms.length === 0 ? (
          <Text variant="body-md" tone="secondary" className="mt-4">
            Nenhuma sala encontrada.
          </Text>
        ) : (
          <div role="table" aria-label="Lista de salas">
            {filteredRooms.map((room) => (
              <RoomChecklistItem
                key={room.id}
                room={room.room}
                hasChecklist={room.hasChecklist}
                onView={() => router.push(`/checklist/gestao-itens/${room.id}`)}
                onCreate={() =>
                  router.push(`/checklist/gestao-itens/${room.id}/criar`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
