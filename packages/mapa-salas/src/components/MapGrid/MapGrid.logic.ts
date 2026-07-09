import type { RoomMapGridPosition, UnassignedStudent } from '../../types'
import type { SeatCardState } from '../SeatCard'

export function positionKey(x: number, y: number) {
  return `${x},${y}`
}

/**
 * Calcula o SeatCardState de uma posição STUDENT a partir da allocation já
 * resolvida (ou ausente) e do aluno atualmente selecionado no sidebar.
 */
export function resolveStudentSeatState(
  allocation: UnassignedStudent | undefined,
  selectedStudentId: string | null,
): SeatCardState {
  if (!allocation) return 'available'

  return allocation.id === selectedStudentId ? 'selected' : 'occupied'
}

/**
 * true quando a posição deve renderizar um espaçador (div vazia) em vez de
 * assento — obstáculo, equipamento, ou coordenada sem position no template.
 */
export function isSpacerPosition(position: RoomMapGridPosition | undefined): boolean {
  return !position || position.type === 'OBSTACLE' || position.type === 'EQUIPMENT'
}