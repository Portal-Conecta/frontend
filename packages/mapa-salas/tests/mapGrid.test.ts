import { describe, expect, it } from 'vitest'

import {
  isSpacerPosition,
  positionKey,
  resolveStudentSeatState,
} from '../src/components/MapGrid/MapGrid.logic'
import type { RoomMapGridPosition, UnassignedStudent } from '../src/types'

function makeStudent(overrides: Partial<UnassignedStudent> = {}): UnassignedStudent {
  return {
    id: 'student-1',
    name: 'Aluno Teste',
    ...overrides,
  } as UnassignedStudent
}

function makePosition(overrides: Partial<RoomMapGridPosition> = {}): RoomMapGridPosition {
  return {
    layoutPositionId: 'pos-1',
    seatNumber: null,
    positionX: 0,
    positionY: 0,
    type: 'STUDENT',
    ...overrides,
  }
}

describe('positionKey', () => {
  it('gera uma chave estável e única por coordenada', () => {
    expect(positionKey(0, 0)).toBe('0,0')
    expect(positionKey(2, 5)).toBe('2,5')
    expect(positionKey(2, 5)).not.toBe(positionKey(5, 2))
  })
})

describe('resolveStudentSeatState', () => {
  it('retorna "available" quando não há allocation para a posição', () => {
    expect(resolveStudentSeatState(undefined, null)).toBe('available')
  })

  it('retorna "selected" quando a allocation é o aluno selecionado no sidebar', () => {
    const student = makeStudent({ id: 'student-1' })

    expect(resolveStudentSeatState(student, 'student-1')).toBe('selected')
  })

  it('retorna "occupied" quando há allocation mas não é o aluno selecionado', () => {
    const student = makeStudent({ id: 'student-1' })

    expect(resolveStudentSeatState(student, 'student-2')).toBe('occupied')
    expect(resolveStudentSeatState(student, null)).toBe('occupied')
  })
})

describe('isSpacerPosition — regra do espaçador', () => {
  it('é espaçador quando a posição está ausente (célula fora do template)', () => {
    expect(isSpacerPosition(undefined)).toBe(true)
  })

  it('é espaçador para OBSTACLE', () => {
    expect(isSpacerPosition(makePosition({ type: 'OBSTACLE' }))).toBe(true)
  })

  it('é espaçador para EQUIPMENT', () => {
    expect(isSpacerPosition(makePosition({ type: 'EQUIPMENT' }))).toBe(true)
  })

  it('NÃO é espaçador para TEACHER', () => {
    expect(isSpacerPosition(makePosition({ type: 'TEACHER' }))).toBe(false)
  })

  it('NÃO é espaçador para STUDENT', () => {
    expect(isSpacerPosition(makePosition({ type: 'STUDENT' }))).toBe(false)
  })
})