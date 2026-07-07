export type LayoutPositionType = 'STUDENT' | 'TEACHER' | 'EQUIPMENT' | 'OBSTACLE'

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

