// ── Enum runtime (espelha LayoutPositionType do back) ──────────────────────

export const LAYOUT_POSITION_TYPE = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  EQUIPMENT: 'EQUIPMENT',
  OBSTACLE: 'OBSTACLE',
} as const

export type LayoutPositionType = (typeof LAYOUT_POSITION_TYPE)[keyof typeof LAYOUT_POSITION_TYPE]

// ── Grid (base do PR #237, sem alteração no tipo) ──────────────────────────

export type RoomMapGridPosition = {
  layoutPositionId: string
  /** null para qualquer type que não seja STUDENT */
  seatNumber: number | null
  positionX: number
  positionY: number
  type: LayoutPositionType
}

export type RoomMapGrid = {
  rows: number
  columns: number
  totalSeats: number
  positions: RoomMapGridPosition[]
}

// ── Mapa ────────────────────────────────────────────────────────────────────
// Espelha RoomMapResponse do back (id, classId, roomId, layoutTemplateId).

export type RoomMap = {
  id: string
  classId: string
  roomId: string
  layoutTemplateId: string
}

// ── Alocação ────────────────────────────────────────────────────────────────
// Espelha RoomMapAllocationResponse.
// NOTA: campos seguem o nome do back (studentId/studentName).
// O mapeamento para UnassignedStudent (id/name) fica no service/hook.

export type RoomMapAllocation = {
  studentId: string
  studentName: string
  seatNumber: number
  layoutPositionId: string
}

// ── Wire de não-alocado ────────────────────────────────────────────────────
/** Wire do back — mapear para `UnassignedStudent` (id/name) no service. */
export type UnassignedStudentDto = {
  studentId: string
  studentName: string
}

// ── View (union discriminada) ──────────────────────────────────────────────
// Espelha RoomMapViewResponse.
// O back valida: suggested=true → map=null; suggested=false → map obrigatório.
// A union garante isso em nível de tipo.

type RoomMapViewBase = {
  grid: RoomMapGrid
  allocations: RoomMapAllocation[]
  /** Campo singular no back mas é uma lista. */
  unassignedStudent: UnassignedStudentDto[]
}

export type RoomMapView =
  | (RoomMapViewBase & { suggested: true; map: null })
  | (RoomMapViewBase & { suggested: false; map: RoomMap })

// ── Summary ─────────────────────────────────────────────────────────────────
// Espelha RoomMapSummaryResponse.
// NOTA: O back usa `salaId` neste DTO, enquanto RoomMapResponse usa `roomId`.
// Isso é divergência real do back — não é typo.

export type RoomMapSummary = {
  id: string
  classId: string
  salaId: string
  createdAt: string
  updatedAt: string
}

// ── Histórico ───────────────────────────────────────────────────────────────
// Espelha RoomMapHistoryResponse.

export type RoomMapHistory = {
  id: string
  roomMapId: string
  userId: string
  action: string
  details: string
  createdAt: string
}

// ── Paginação (seguindo padrão ListAnnouncementsResponse do comunicados) ────

export type RoomMapPageResponse = {
  content: RoomMapSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type RoomMapHistoryPageResponse = {
  content: RoomMapHistory[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}