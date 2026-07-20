"use client";

import { useEffect, useState } from "react";

import { listTemplatesClient } from "../services/client/templateClient";

export interface AvailableRoom {
  id: string;
  number: number;
  name: string;
  templateId: string;
}

const ROOM_TYPE_LABEL: Record<string, string> = {
  LABORATORY: "Laboratório",
  CLASSROOM: "Sala de aula",
};

function roomLabel(typeRoom: string): string {
  return ROOM_TYPE_LABEL[typeRoom] ?? typeRoom;
}

/** Lista as salas disponíveis pra criar um checklist (têm template ACTIVE). */
export function useAvailableRooms() {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const templates = await listTemplatesClient();
        if (cancelled) return;

        const byRoomId = new Map<string, AvailableRoom>();
        for (const template of templates) {
          if (template.status !== "ACTIVE" || !template.room) continue;

          const existing = byRoomId.get(template.room.id);
          if (existing && existing.templateId > template.id) continue;

          byRoomId.set(template.room.id, {
            id: template.room.id,
            number: template.room.number,
            name: roomLabel(template.room.typeRoom),
            templateId: template.id,
          });
        }

        setRooms(Array.from(byRoomId.values()));
      } catch {
        if (!cancelled) setError("Não foi possível carregar as salas disponíveis.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rooms, loading, error };
}
