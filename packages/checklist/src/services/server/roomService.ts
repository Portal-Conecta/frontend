import { createHttpClient } from "@portal/core/http/httpClient";
import { hubGatewayPath } from "@portal/core/http/hubGateway";

import type { Room } from "../../components/RoomSelector/RoomSelector";

const http = createHttpClient("API_GATEWAY_URL");

type HubRoomType = "CLASSROOM" | "LABORATORY" | "AUDITORIUM" | "OTHER";

interface HubRoom {
  id: string;
  number: number;
  typeRoom: HubRoomType;
  status: string;
}

const ROOM_TYPE_LABEL: Record<HubRoomType, string> = {
  CLASSROOM: "Sala de aula",
  LABORATORY: "Laboratório",
  AUDITORIUM: "Auditório",
  OTHER: "Outro",
};

export async function listRooms(): Promise<Room[]> {
  const rooms = await http.get<HubRoom[]>(hubGatewayPath("/rooms"));
  return rooms.map((room) => ({
    id: room.id,
    number: room.number,
    name: ROOM_TYPE_LABEL[room.typeRoom] ?? room.typeRoom,
  }));
}