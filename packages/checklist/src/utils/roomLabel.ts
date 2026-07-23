// O Hub tem dois conjuntos de valores de `typeRoom` em circulação: a `main`
// (produção) usa categorias específicas por laboratório desde um hotfix que
// ainda não voltou pra `develop` (ver core-backend#304); a `develop` ainda
// está no conjunto genérico anterior. Mapeamos os dois pra não depender de
// qual lado está no ar — sem isso, qualquer um dos dois cai no fallback cru
// em inglês (ver `roomTypeLabel`).
const ROOM_TYPE_LABEL: Record<string, string> = {
  CLASSROOM: "Sala de aula",
  // Genérico (develop, hoje)
  LABORATORY: "Laboratório",
  AUDITORIUM: "Auditório",
  OTHER: "Outro",
  // Específico (main, pós-hotfix)
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
