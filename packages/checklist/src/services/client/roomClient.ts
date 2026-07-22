import { bffFetch } from "@portal/core/http/bffClient";
import type { RoomResponse } from "../../types/template";

/** Lista todas as salas do Hub via BFF (GET /api/checklist/rooms). */
export function listRoomsClient(): Promise<RoomResponse[]> {
  return bffFetch<RoomResponse[]>("/api/checklist/rooms");
}
