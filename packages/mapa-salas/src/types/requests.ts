export const MOVE_CONFLICT_STRATEGY = {
  DISPLACE: 'DISPLACE',
  SWAP: 'SWAP',
} as const

export type MoveConflictStrategy = (typeof MOVE_CONFLICT_STRATEGY)[keyof typeof MOVE_CONFLICT_STRATEGY]

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

export type AllocationEntryRequest = {
  studentId: string
  layoutPositionId: string
}

export type UpdateRoomMapAllocationsRequest = {
  allocations: AllocationEntryRequest[]
}

export type MoveStudentRequest = {
  studentId: string
  targetLayoutPositionId: string
  onConflict?: MoveConflictStrategy
}

export type CreateRoomLayoutRequest = {
  roomId: string
  layoutTemplateId: string
}
