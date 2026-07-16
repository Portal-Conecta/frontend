import { describe, expect, it } from 'vitest'

import { HttpError } from '@portal/core/http/errors'

import {
  buildGridFromLayout,
  buildSessionFromLayout,
  buildSessionFromView,
  computeCanSave,
  LAYOUT_NOT_FOUND_ERROR,
  LOAD_LAYOUT_ERROR,
  resolveLayoutErrorMessage,
  toCreateLocations,
  type MapCreateSession,
} from '../../src/pages/roomMapEditModel'
import type {
  AllocationEntryRequest,
  LayoutTemplateWithPositions,
  RoomMapView,
} from '../../src/types'

const grid = {
  rows: 1,
  columns: 2,
  totalSeats: 2,
  positions: [
    { layoutPositionId: 'p1', seatNumber: 1, positionX: 0, positionY: 0, type: 'STUDENT' as const },
    { layoutPositionId: 'p2', seatNumber: 2, positionX: 1, positionY: 0, type: 'STUDENT' as const },
  ],
}

const savedView: RoomMapView = {
  suggested: false,
  map: { id: 'm1', classId: 'turma-1', roomId: 'sala-1', layoutTemplateId: 'lt1' },
  grid,
  allocations: [{ studentId: 's1', studentName: 'Ana', seatNumber: 1, layoutPositionId: 'p1' }],
  unassignedStudent: [],
}

const suggestedView: RoomMapView = {
  suggested: true,
  map: null,
  grid,
  allocations: [],
  unassignedStudent: [{ studentId: 's1', studentName: 'Ana' }],
}

// Posições fora de ordem de propósito: a numeração dos assentos deve seguir a
// ordem de leitura do mapa (linha por linha), não a ordem do payload.
const layout: LayoutTemplateWithPositions = {
  layoutTemplateId: 'lt1',
  dimensionX: 3,
  dimensionY: 2,
  positions: [
    { positionX: 2, positionY: 1, type: 'STUDENT' },
    { positionX: 1, positionY: 0, type: 'TEACHER' },
    { positionX: 0, positionY: 1, type: 'STUDENT' },
    { positionX: 1, positionY: 1, type: 'OBSTACLE' },
  ],
}

describe('buildSessionFromView', () => {
  it('view salva (suggested=false) vira sessão existing com o id do mapa', () => {
    expect(buildSessionFromView(savedView)).toEqual({
      kind: 'existing',
      mapId: 'm1',
      initialView: savedView,
    })
  })

  it('view sugerida (suggested=true) vira sessão suggested', () => {
    expect(buildSessionFromView(suggestedView)).toEqual({
      kind: 'suggested',
      initialView: suggestedView,
    })
  })
})

describe('buildGridFromLayout', () => {
  it('espelha as dimensões do layout (linhas=dimensionY, colunas=dimensionX)', () => {
    const built = buildGridFromLayout(layout)

    expect(built.rows).toBe(2)
    expect(built.columns).toBe(3)
    expect(built.positions).toHaveLength(4)
  })

  it('numera só os assentos STUDENT, em ordem de leitura (linha, depois coluna)', () => {
    const built = buildGridFromLayout(layout)
    const byCoordinate = new Map(
      built.positions.map((position) => [`${position.positionX},${position.positionY}`, position]),
    )

    // (0,1) vem antes de (2,1) na leitura — recebe o assento 1.
    expect(byCoordinate.get('0,1')?.seatNumber).toBe(1)
    expect(byCoordinate.get('2,1')?.seatNumber).toBe(2)
    expect(byCoordinate.get('1,0')?.seatNumber).toBeNull()
    expect(byCoordinate.get('1,1')?.seatNumber).toBeNull()
    expect(built.totalSeats).toBe(2)
  })

  it('preserva o type e gera layoutPositionId sintético único por coordenada', () => {
    const built = buildGridFromLayout(layout)
    const ids = built.positions.map((position) => position.layoutPositionId)

    expect(new Set(ids).size).toBe(ids.length)
    expect(built.positions.find((p) => p.positionX === 1 && p.positionY === 0)?.type).toBe('TEACHER')
  })
})

describe('buildSessionFromLayout', () => {
  it('cria sessão layout com view sintetizada sem alocações nem alunos', () => {
    const session = buildSessionFromLayout(layout)

    expect(session.kind).toBe('layout')
    if (session.kind !== 'layout') return
    expect(session.layoutTemplateId).toBe('lt1')
    expect(session.initialView.suggested).toBe(true)
    expect(session.initialView.map).toBeNull()
    expect(session.initialView.allocations).toEqual([])
    expect(session.initialView.unassignedStudent).toEqual([])
    expect(session.initialView.grid.totalSeats).toBe(2)
  })
})

describe('computeCanSave', () => {
  it('bloqueia sempre que há aluno sem lugar, mesmo com rascunho sujo', () => {
    expect(computeCanSave({ sessionKind: 'existing', isDirty: true, unassignedCount: 1 })).toBe(false)
    expect(computeCanSave({ sessionKind: 'layout', isDirty: false, unassignedCount: 2 })).toBe(false)
  })

  it('com todos alocados, exige rascunho sujo nas sessões existing/suggested', () => {
    expect(computeCanSave({ sessionKind: 'existing', isDirty: false, unassignedCount: 0 })).toBe(false)
    expect(computeCanSave({ sessionKind: 'suggested', isDirty: false, unassignedCount: 0 })).toBe(false)
    expect(computeCanSave({ sessionKind: 'existing', isDirty: true, unassignedCount: 0 })).toBe(true)
    expect(computeCanSave({ sessionKind: 'suggested', isDirty: true, unassignedCount: 0 })).toBe(true)
  })

  it('sessão layout salva mesmo sem sujeira (nasce sem alunos — nunca fica dirty)', () => {
    expect(computeCanSave({ sessionKind: 'layout', isDirty: false, unassignedCount: 0 })).toBe(true)
  })
})

describe('toCreateLocations', () => {
  const entries: AllocationEntryRequest[] = [
    { studentId: 's1', layoutPositionId: 'layout:0:1' },
    { studentId: 's2', layoutPositionId: 'layout:2:1' },
  ]

  it('sessão suggested envia os ids reais das posições', () => {
    const session = buildSessionFromView(suggestedView) as MapCreateSession
    const realEntries: AllocationEntryRequest[] = [{ studentId: 's1', layoutPositionId: 'p2' }]

    expect(toCreateLocations(session, realEntries)).toEqual([
      { studentId: 's1', layoutPositionId: 'p2' },
    ])
  })

  it('sessão layout traduz o id sintético para seatNumber', () => {
    const session = buildSessionFromLayout(layout) as MapCreateSession

    expect(toCreateLocations(session, entries)).toEqual([
      { studentId: 's1', seatNumber: 1 },
      { studentId: 's2', seatNumber: 2 },
    ])
  })

  it('sessão layout descarta entradas de posição desconhecida ou sem assento', () => {
    const session = buildSessionFromLayout(layout) as MapCreateSession
    const withInvalid: AllocationEntryRequest[] = [
      { studentId: 's1', layoutPositionId: 'layout:9:9' },
      // (1,0) é TEACHER — seatNumber null, não vira location.
      { studentId: 's2', layoutPositionId: 'layout:1:0' },
      { studentId: 's3', layoutPositionId: 'layout:0:1' },
    ]

    expect(toCreateLocations(session, withInvalid)).toEqual([{ studentId: 's3', seatNumber: 1 }])
  })
})

describe('resolveLayoutErrorMessage', () => {
  it('not_found vira a mensagem de sala sem layout', () => {
    expect(resolveLayoutErrorMessage(new HttpError('not_found', 404))).toBe(LAYOUT_NOT_FOUND_ERROR)
  })

  it('demais falhas (HttpError de outro kind ou erro genérico) viram a mensagem transitória', () => {
    expect(resolveLayoutErrorMessage(new HttpError('forbidden', 403))).toBe(LOAD_LAYOUT_ERROR)
    expect(resolveLayoutErrorMessage(new HttpError('server', 500))).toBe(LOAD_LAYOUT_ERROR)
    expect(resolveLayoutErrorMessage(new Error('boom'))).toBe(LOAD_LAYOUT_ERROR)
  })
})
