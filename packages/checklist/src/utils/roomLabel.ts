const ROOM_TYPE_LABEL: Record<string, string> = {
  LABORATORY: "Laboratório de Informática",
  CLASSROOM: "Sala de aula",
};

/** Traduz o `typeRoom` cru do Hub pro rótulo em português usado na UI. */
export function roomTypeLabel(typeRoom: string): string {
  return ROOM_TYPE_LABEL[typeRoom] ?? typeRoom;
}

/** Formata `{number} - {tipo}` a partir do `room` resolvido no Hub, com fallback se ausente. */
export function formatRoomLabel(
  room: { number: number; typeRoom: string } | undefined,
  fallback = "Sala",
): string {
  return room ? `${room.number} - ${roomTypeLabel(room.typeRoom)}` : fallback;
}
