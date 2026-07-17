/**
 * Testes do service client de mapas de sala (`services/client/roomMapClient`).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createRoomMapClient,
  getRoomLayoutClient,
  getRoomMapViewClient,
  listRoomMapsClient,
} from '../../src/services/client/roomMapClient'
import type { CreateRoomMapRequest, RoomMapPageResponse } from '../../src/types'

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

const pageResponse: RoomMapPageResponse = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('listRoomMapsClient', () => {
  it('lista os mapas em GET /api/mapa-salas/mapas com a query montada', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pageResponse))

    await expect(listRoomMapsClient({ page: 0, size: 20 })).resolves.toEqual(pageResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/mapa-salas/mapas?page=0&size=20')
    expect(init?.method).toBeUndefined()
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(listRoomMapsClient()).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('getRoomMapViewClient', () => {
  it('carrega a view em GET /api/mapa-salas/mapas/salas/{salaId}/turmas/{turmaId}', async () => {
    const fetchMock = stubFetch()
    const view = { suggested: true, map: null, grid: null, allocations: [], unassignedStudent: [] }
    fetchMock.mockResolvedValue(response(200, view))

    await expect(getRoomMapViewClient('sala-1', 'turma-1')).resolves.toEqual(view)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/mapa-salas/mapas/salas/sala-1/turmas/turma-1')
    expect(init?.method).toBeUndefined()
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getRoomMapViewClient('sala-1', 'missing')).rejects.toMatchObject({ kind: 'not_found' })
  })
})

describe('createRoomMapClient', () => {
  const request: CreateRoomMapRequest = {
    classId: 'turma-1',
    roomId: 'sala-1',
    layoutTemplateId: 'lt1',
  }

  it('cria o mapa em POST /api/mapa-salas/mapas com o body JSON', async () => {
    const fetchMock = stubFetch()
    const view = { suggested: false, map: { id: 'm1' }, grid: null, allocations: [], unassignedStudent: [] }
    fetchMock.mockResolvedValue(response(201, view))

    await expect(createRoomMapClient(request)).resolves.toEqual(view)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/mapa-salas/mapas')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual(request)
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(createRoomMapClient(request)).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('getRoomLayoutClient', () => {
  it('carrega o layout em GET /api/mapa-salas/layouts/salas/{salaId}', async () => {
    const fetchMock = stubFetch()
    const layout = { layoutTemplateId: 'lt1', dimensionX: 2, dimensionY: 2, positions: [] }
    fetchMock.mockResolvedValue(response(200, layout))

    await expect(getRoomLayoutClient('sala-1')).resolves.toEqual(layout)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/mapa-salas/layouts/salas/sala-1')
    expect(init?.method).toBeUndefined()
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getRoomLayoutClient('missing')).rejects.toMatchObject({ kind: 'not_found' })
  })
})
