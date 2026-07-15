import { describe, expect, it } from 'vitest'

import { toDraftAllocations, toUnassignedStudents } from '../../src/pages/roomMapViewModel'
import type { RoomMapAllocation, UnassignedStudentDto } from '../../src/types'

describe('toDraftAllocations', () => {
  it('mapeia allocations por layoutPositionId para UnassignedStudent (id/name)', () => {
    const allocations: RoomMapAllocation[] = [
      { studentId: 's1', studentName: 'Ana', seatNumber: 1, layoutPositionId: 'p1' },
      { studentId: 's2', studentName: 'Bruno', seatNumber: 2, layoutPositionId: 'p2' },
    ]

    const draft = toDraftAllocations(allocations)

    expect(draft.size).toBe(2)
    expect(draft.get('p1')).toEqual({ id: 's1', name: 'Ana' })
    expect(draft.get('p2')).toEqual({ id: 's2', name: 'Bruno' })
  })

  it('retorna um Map vazio quando não há allocations', () => {
    expect(toDraftAllocations([]).size).toBe(0)
  })

  it('a última allocation vence em caso de layoutPositionId repetido', () => {
    const allocations: RoomMapAllocation[] = [
      { studentId: 's1', studentName: 'Ana', seatNumber: 1, layoutPositionId: 'p1' },
      { studentId: 's2', studentName: 'Bruno', seatNumber: 1, layoutPositionId: 'p1' },
    ]

    expect(toDraftAllocations(allocations).get('p1')).toEqual({ id: 's2', name: 'Bruno' })
  })
})

describe('toUnassignedStudents', () => {
  it('mapeia o DTO (studentId/studentName) para UnassignedStudent (id/name)', () => {
    const dtos: UnassignedStudentDto[] = [
      { studentId: 's3', studentName: 'Carla' },
      { studentId: 's4', studentName: 'Diego' },
    ]

    expect(toUnassignedStudents(dtos)).toEqual([
      { id: 's3', name: 'Carla' },
      { id: 's4', name: 'Diego' },
    ])
  })

  it('retorna lista vazia para entrada vazia', () => {
    expect(toUnassignedStudents([])).toEqual([])
  })
})
