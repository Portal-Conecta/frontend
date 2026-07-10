// ── Enum runtime ───────────────────────────────────────────────────────────

export const MOVE_CONFLICT_STRATEGY = {
  DISPLACE: 'DISPLACE',
  SWAP: 'SWAP',
} as const

export type MoveConflictStrategy = (typeof MOVE_CONFLICT_STRATEGY)[keyof typeof MOVE_CONFLICT_STRATEGY]

// ── Criar mapa ─────────────────────────────────────────────────────────────

export type CreateRoomMapInitialAllocationRequest = {
  studentId: string
  seatNumber?: number | null
  layoutPositionId?: string | null
}

export type CreateRoomMapRequest = {
  classId: string
  roomId: string
  layoutTemplateId: string
  locations?: CreateRoomMapInitialAllocationRequest[]
}

// ── Atualizar alocações ────────────────────────────────────────────────────

export type AllocationEntryRequest = {
  studentId: string
  layoutPositionId: string
}

export type UpdateRoomMapAllocationsRequest = {
  allocations: AllocationEntryRequest[]
}

// ── Mover aprendiz ─────────────────────────────────────────────────────────

export type MoveStudentRequest = {
  studentId: string
  targetLayoutPositionId: string
  onConflict?: MoveConflictStrategy
}

// ── Vincular layout à sala ─────────────────────────────────────────────────

export type CreateRoomLayoutRequest = {
  roomId: string
  layoutTemplateId: string
}