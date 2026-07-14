/**
 * Testes do service server de mapas de sala (`services/server/roomMapService`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@portal/core/auth/session', () => ({
  getSession: () => Promise.resolve('jwt-token'),
}))

import {
  archiveRoomMap,
  createRoomMap,
  getRoomMapView,
  listRoomMaps,
  moveStudent,
  updateAllocations,
} from '../../src/services/server/roomMapService'
import type {
  CreateRoomMapRequest,
  RoomMapGrid,
  RoomMapPageResponse,
  RoomMapView,
} from '../../src/types'

const API_GATEWAY_URL = 'https://gateway.test'
const MAP_ID = 'm1'

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

/** Resposta 204 — sem corpo; `json()` não deveria ser chamado por quem consome. */
function emptyResponse(status = 204): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new Error('204 não tem corpo — json() não deveria ser chamado')
    },
  } as unknown as Response
}

function stubFetch() {
  const mock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', mock)
  return mock
}

const grid: RoomMapGrid = {
  rows: 1,
  columns: 2,
  totalSeats: 2,
  positions: [
    { layoutPositionId: 'p1', seatNumber: 1, positionX: 0, positionY: 0, type: 'STUDENT' },
    { layoutPositionId: 'p2', seatNumber: 2, positionX: 1, positionY: 0, type: 'STUDENT' },
  ],
}

const savedView: RoomMapView = {
  suggested: false,
  map: { id: 'm1', classId: 'turma-1', roomId: 'sala-1', layoutTemplateId: 'lt1' },
  grid,
  allocations: [
    { studentId: 's1', studentName: 'Ana Souza', seatNumber: 1, layoutPositionId: 'p1' },
  ],
  unassignedStudent: [],
}

const suggestedView: RoomMapView = {
  suggested: true,
  map: null,
  grid,
  allocations: [
    { studentId: 's1', studentName: 'Ana Souza', seatNumber: 1, layoutPositionId: 'p1' },
    { studentId: 's2', studentName: 'Bruno Lima', seatNumber: 2, layoutPositionId: 'p2' },
  ],
  unassignedStudent: [{ studentId: 's3', studentName: 'Carla Dias' }],
}

const updatedView: RoomMapView = {
  suggested: false,
  map: { id: MAP_ID, classId: 'turma-1', roomId: 'sala-1', layoutTemplateId: 'lt1' },
  grid,
  allocations: [
    { studentId: 's1', studentName: 'Ana Souza', seatNumber: 1, layoutPositionId: 'p1' },
    { studentId: 's2', studentName: 'Bruno Lima', seatNumber: 2, layoutPositionId: 'p2' },
  ],
  unassignedStudent: [],
}

const pageResponse: RoomMapPageResponse = {
  content: [
    {
      id: 'm1',
      classId: 'turma-1',
      salaId: 'sala-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('listRoomMaps', () => {
  it('faz GET em /api/mapas com Bearer, repassando a paginação como query', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pageResponse))

    await expect(listRoomMaps({ page: 0, size: 20 })).resolves.toEqual(pageResponse)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/mapas?page=0&size=20`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('faz GET em /api/mapas sem query quando não há paginação', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pageResponse))

    await expect(listRoomMaps()).resolves.toEqual(pageResponse)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/mapas`)
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(listRoomMaps()).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('getRoomMapView', () => {
  it('faz GET em /api/mapas/salas/{salaId}/turmas/{turmaId} com Bearer e retorna o mapa salvo', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, savedView))

    await expect(getRoomMapView('sala-1', 'turma-1')).resolves.toEqual(savedView)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/mapas/salas/sala-1/turmas/turma-1`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('retorna a sugestão alfabética (suggested=true, map=null) para turma sem mapa salvo', async () => {
    stubFetch().mockResolvedValue(response(200, suggestedView))

    await expect(getRoomMapView('sala-1', 'turma-2')).resolves.toEqual(suggestedView)
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getRoomMapView('sala-1', 'missing')).rejects.toMatchObject({ kind: 'not_found' })
  })

  it('mapeia erro de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(getRoomMapView('sala-1', 'turma-1')).rejects.toMatchObject({ kind: 'network' })
  })
})

describe('createRoomMap', () => {
  const request: CreateRoomMapRequest = {
    classId: 'turma-1',
    roomId: 'sala-1',
    layoutTemplateId: 'lt1',
    locations: [{ studentId: 's1', layoutPositionId: 'p1' }],
  }

  it('faz POST em /api/mapas com Bearer e o body JSON, retornando a view criada', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, savedView))

    await expect(createRoomMap(request)).resolves.toEqual(savedView)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/mapas`)
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
    expect(JSON.parse(init?.body as string)).toEqual(request)
  })

  it('mapeia 403 (sem role TEACHER na turma) para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(createRoomMap(request)).rejects.toMatchObject({ kind: 'forbidden' })
  })

  it('mapeia 400 para HttpError validation preservando o body de erro', async () => {
    const errorBody = {
      message: 'Validação falhou',
      errors: [{ field: 'layoutTemplateId', message: 'não encontrado' }],
    }
    stubFetch().mockResolvedValue(response(400, errorBody))

    await expect(createRoomMap(request)).rejects.toMatchObject({
      kind: 'validation',
      body: errorBody,
    })
  })
})

describe('updateAllocations', () => {
  const request = {
    allocations: [
      { studentId: 's1', layoutPositionId: 'p1' },
      { studentId: 's2', layoutPositionId: 'p2' },
    ],
  }

  it('faz PUT em /api/mapas/{id}/allocations com Bearer e body, retornando o view atualizado', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, updatedView))

    await expect(updateAllocations(MAP_ID, request)).resolves.toEqual(updatedView)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/mapas/${MAP_ID}/allocations`)
    expect(init?.method).toBe('PUT')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
    expect(JSON.parse(init?.body as string)).toEqual(request)
  })

  it('mapeia 400 (lista vazia/duplicada/posição inválida) para HttpError', async () => {
    stubFetch().mockResolvedValue(response(400, { message: 'validação falhou' }))
    await expect(updateAllocations(MAP_ID, request)).rejects.toMatchObject({ kind: 'validation' })
  })

  it('mapeia 403 (professor sem vínculo) para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(updateAllocations(MAP_ID, request)).rejects.toMatchObject({ kind: 'forbidden' })
  })

  it('mapeia 404 (mapa não encontrado/arquivado) para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(updateAllocations(MAP_ID, request)).rejects.toMatchObject({ kind: 'not_found' })
  })
})

describe('moveStudent', () => {
  const request = { studentId: 's1', targetLayoutPositionId: 'p2', onConflict: 'SWAP' as const }

  it('faz PATCH em /api/mapas/{id}/locations/move com Bearer e body, sem corpo de retorno (204)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(emptyResponse())

    await expect(moveStudent(MAP_ID, request)).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/mapas/${MAP_ID}/locations/move`)
    expect(init?.method).toBe('PATCH')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
    expect(JSON.parse(init?.body as string)).toEqual(request)
  })

  it('usa DISPLACE (default do back) quando onConflict é omitido', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(emptyResponse())
    const requestWithoutConflict = { studentId: 's1', targetLayoutPositionId: 'p2' }

    await expect(moveStudent(MAP_ID, requestWithoutConflict)).resolves.toBeUndefined()

    const [, init] = fetchMock.mock.calls[0]!
    expect(JSON.parse(init?.body as string)).toEqual(requestWithoutConflict)
  })

  it('mapeia 400 (posição inválida ou mapa arquivado) para HttpError', async () => {
    stubFetch().mockResolvedValue(response(400, {}))
    await expect(moveStudent(MAP_ID, request)).rejects.toMatchObject({ kind: 'validation' })
  })

  it('mapeia 403 (sem permissão/vínculo) para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(moveStudent(MAP_ID, request)).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('archiveRoomMap', () => {
  it('faz PATCH em /api/mapas/{id}/arquivar com Bearer e sem body, sem corpo de retorno (204)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(emptyResponse())

    await expect(archiveRoomMap(MAP_ID)).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/mapas/${MAP_ID}/arquivar`)
    expect(init?.method).toBe('PATCH')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('mapeia 400 (mapa já arquivado) para HttpError', async () => {
    stubFetch().mockResolvedValue(response(400, {}))
    await expect(archiveRoomMap(MAP_ID)).rejects.toMatchObject({ kind: 'validation' })
  })

  it('mapeia 404 (mapa não encontrado) para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(archiveRoomMap(MAP_ID)).rejects.toMatchObject({ kind: 'not_found' })
  })
})
