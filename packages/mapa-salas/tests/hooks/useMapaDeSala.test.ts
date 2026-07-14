import { describe, expect, it } from 'vitest'

import {
  clearAll,
  computeIsDirty,
  handleSeatClick,
  initDraftState,
  selectStudent,
  toAllocationEntries,
  unassign,
  type MapaDeSalaDraftState,
} from '../../src/hooks/useMapaDeSala.logic'
import type { RoomMapView } from '../../src/types'

function makeView(overrides: Partial<RoomMapView> = {}): RoomMapView {
  return {
    suggested: false,
    map: { id: 'map-1', classId: 'class-1', roomId: 'room-1', layoutTemplateId: 'template-1' },
    grid: { rows: 1, columns: 2, totalSeats: 2, positions: [] },
    allocations: [
      { studentId: 'student-1', studentName: 'Ana Souza', seatNumber: 1, layoutPositionId: 'pos-1' },
    ],
    unassignedStudent: [{ studentId: 'student-2', studentName: 'Bruno Lima' }],
    ...overrides,
  } as RoomMapView
}

describe('initDraftState', () => {
  it('monta draftAllocations e unassignedStudents a partir do view', () => {
    const state = initDraftState(makeView())

    expect(state.draftAllocations.get('pos-1')).toEqual({ id: 'student-1', name: 'Ana Souza' })
    expect(state.unassignedStudents).toEqual([{ id: 'student-2', name: 'Bruno Lima' }])
    expect(state.selectedStudentId).toBeNull()
  })
})

describe('handleSeatClick — alocar', () => {
  it('aluno da sidebar selecionado + assento livre: aloca e some da sidebar', () => {
    const state = selectStudent(initDraftState(makeView()), 'student-2')

    const next = handleSeatClick(state, 'pos-2')

    expect(next.draftAllocations.get('pos-2')).toEqual({ id: 'student-2', name: 'Bruno Lima' })
    expect(next.unassignedStudents).toEqual([])
    expect(next.selectedStudentId).toBeNull()
  })

  it('sem seleção + assento livre: no-op', () => {
    const state = initDraftState(makeView())

    const next = handleSeatClick(state, 'pos-2')

    expect(next).toBe(state)
  })

  it('sem seleção + assento ocupado: seleciona o aluno do assento', () => {
    const state = initDraftState(makeView())

    const next = handleSeatClick(state, 'pos-1')

    expect(next.selectedStudentId).toBe('student-1')
    expect(next.draftAllocations).toBe(state.draftAllocations)
  })
})

describe('handleSeatClick — mover com conflito (swap)', () => {
  it('aluno já sentado selecionado + assento livre: move (some do assento antigo)', () => {
    const withSelection = selectStudent(initDraftState(makeView()), 'student-1')

    const next = handleSeatClick(withSelection, 'pos-2')

    expect(next.draftAllocations.has('pos-1')).toBe(false)
    expect(next.draftAllocations.get('pos-2')).toEqual({ id: 'student-1', name: 'Ana Souza' })
  })

  it('selecionado veio da sidebar + assento ocupado: swap — ocupante volta pra sidebar', () => {
    const withSelection = selectStudent(initDraftState(makeView()), 'student-2')

    const next = handleSeatClick(withSelection, 'pos-1')

    expect(next.draftAllocations.get('pos-1')).toEqual({ id: 'student-2', name: 'Bruno Lima' })
    expect(next.unassignedStudents).toEqual([{ id: 'student-1', name: 'Ana Souza' }])
  })

  it('selecionado já sentado + assento ocupado: swap — troca os dois de assento', () => {
    const view = makeView({
      allocations: [
        { studentId: 'student-1', studentName: 'Ana Souza', seatNumber: 1, layoutPositionId: 'pos-1' },
        { studentId: 'student-3', studentName: 'Carla Nunes', seatNumber: 2, layoutPositionId: 'pos-2' },
      ],
      unassignedStudent: [],
    })
    const withSelection = selectStudent(initDraftState(view), 'student-1')

    const next = handleSeatClick(withSelection, 'pos-2')

    expect(next.draftAllocations.get('pos-2')).toEqual({ id: 'student-1', name: 'Ana Souza' })
    expect(next.draftAllocations.get('pos-1')).toEqual({ id: 'student-3', name: 'Carla Nunes' })
    expect(next.unassignedStudents).toEqual([])
  })

  it('clicar no próprio assento do selecionado: apenas deseleciona', () => {
    const withSelection = selectStudent(initDraftState(makeView()), 'student-1')

    const next = handleSeatClick(withSelection, 'pos-1')

    expect(next.selectedStudentId).toBeNull()
    expect(next.draftAllocations).toBe(withSelection.draftAllocations)
  })
})

describe('unassign — desalocar', () => {
  it('devolve o aluno do assento para a sidebar', () => {
    const state = initDraftState(makeView())

    const next = unassign(state, 'pos-1')

    expect(next.draftAllocations.has('pos-1')).toBe(false)
    expect(next.unassignedStudents).toEqual([
      { id: 'student-2', name: 'Bruno Lima' },
      { id: 'student-1', name: 'Ana Souza' },
    ])
  })

  it('assento livre: no-op', () => {
    const state = initDraftState(makeView())

    const next = unassign(state, 'pos-2')

    expect(next).toBe(state)
  })

  it('limpa a seleção quando o aluno desalocado era o selecionado', () => {
    const state = selectStudent(initDraftState(makeView()), 'student-1')

    const next = unassign(state, 'pos-1')

    expect(next.selectedStudentId).toBeNull()
  })
})

describe('clearAll', () => {
  it('zera o rascunho e devolve todos os alunos alocados para a sidebar', () => {
    const state = initDraftState(makeView())

    const next = clearAll(state)

    expect(next.draftAllocations.size).toBe(0)
    expect(next.unassignedStudents).toEqual(
      expect.arrayContaining([
        { id: 'student-2', name: 'Bruno Lima' },
        { id: 'student-1', name: 'Ana Souza' },
      ]),
    )
    expect(next.selectedStudentId).toBeNull()
  })
})

describe('computeIsDirty', () => {
  it('false quando o rascunho é idêntico ao inicial', () => {
    const state = initDraftState(makeView())

    expect(computeIsDirty(state.draftAllocations, state.draftAllocations)).toBe(false)
  })

  it('true quando o tamanho difere', () => {
    const initial = initDraftState(makeView())
    const changed = handleSeatClick(selectStudent(initial, 'student-2'), 'pos-2')

    expect(computeIsDirty(changed.draftAllocations, initial.draftAllocations)).toBe(true)
  })

  it('true quando a mesma posição tem aluno diferente', () => {
    const initial: MapaDeSalaDraftState = initDraftState(makeView())
    const swapped = new Map(initial.draftAllocations)
    swapped.set('pos-1', { id: 'student-99', name: 'Outro Aluno' })

    expect(computeIsDirty(swapped, initial.draftAllocations)).toBe(true)
  })
})

describe('toAllocationEntries', () => {
  it('converte o Map para o formato AllocationEntryRequest', () => {
    const state = initDraftState(makeView())

    expect(toAllocationEntries(state.draftAllocations)).toEqual([
      { studentId: 'student-1', layoutPositionId: 'pos-1' },
    ])
  })
})
