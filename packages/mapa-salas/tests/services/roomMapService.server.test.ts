/**
 * Testes do service server de mapas de sala (`services/server/roomMapService`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@portal/core/auth/session', () => ({
  getSession: () => Promise.resolve('jwt-token'),
}))

import { getRoomMapView, listRoomMaps } from '../../src/services/server/roomMapService'
import type { RoomMapGrid, RoomMapPageResponse, RoomMapView } from '../../src/types'

const API_GATEWAY_URL = 'https://gateway.test'

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
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
