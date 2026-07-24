const ROOM_TYPE_LABEL: Record<string, string> = {
  CLASSROOM: "Sala de aula",
  ELECTROTECHNICS_LABORATORY: "Laboratório de Eletrotécnica",
  ELECTRONICS_LABORATORY: "Laboratório de Eletrônica",
  COMPUTER_LABORATORY: "Laboratório de Informática",
  CNC_SIMULATION: "Laboratório de Simulação CNC",
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
