"use client";

import { useCallback, useEffect, useState } from "react";

import { messageFor } from "@portal/core/http/errorPresentation";
import { HttpError } from "@portal/core/http/errors";

import { listRoomsClient } from "../services/client/roomClient";

export interface AvailableRoom {
  id: string;
  number: number;
  name: string;
}

const ROOM_TYPE_LABEL: Record<string, string> = {
  LABORATORY: "Laboratório de Informática",
  CLASSROOM: "Sala de aula",
};

function roomLabel(typeRoom: string): string {
  return ROOM_TYPE_LABEL[typeRoom] ?? typeRoom;
}

/** Lista as salas do Hub disponíveis para preencher um checklist. */
export function useAvailableRooms() {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const hubRooms = await listRoomsClient();
        if (cancelled) return;

        setRooms(
          hubRooms.map((room) => ({
            id: room.id,
            number: room.number,
            name: roomLabel(room.typeRoom),
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof HttpError
              ? messageFor(err.kind)
              : "Não foi possível carregar as salas disponíveis.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = useCallback(() => setReloadToken((t) => t + 1), []);

  return { rooms, loading, error, retry };
}
