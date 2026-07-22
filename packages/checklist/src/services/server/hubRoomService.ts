import { createHttpClient } from "@portal/core/http/httpClient";
import { hubGatewayPath } from "@portal/core/http/hubGateway";
import type { RoomResponse } from "../../types/template";

const http = createHttpClient("API_GATEWAY_URL");

/** Lista salas ativas do Hub (`GET /rooms` via gateway `/hub/rooms`). */
export async function listHubRooms(): Promise<RoomResponse[]> {
  return http.get<RoomResponse[]>(hubGatewayPath("/rooms"));
}
