/**
 * Testes do service server de layouts de sala (`services/server/roomLayoutService`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@portal/core/auth/session', () => ({
  getSession: () => Promise.resolve('jwt-token'),
}))

import { getRoomLayout } from '../../src/services/server/roomLayoutService'
import type { LayoutTemplateWithPositions } from '../../src/types'

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

const layout: LayoutTemplateWithPositions = {
  layoutTemplateId: 'lt1',
  dimensionX: 2,
  dimensionY: 2,
  positions: [
    { positionX: 0, positionY: 0, type: 'TEACHER' },
    { positionX: 1, positionY: 0, type: 'STUDENT' },
    { positionX: 0, positionY: 1, type: 'STUDENT' },
    { positionX: 1, positionY: 1, type: 'OBSTACLE' },
  ],
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('getRoomLayout', () => {
  it('faz GET em /api/layouts/salas/{salaId} com Bearer e retorna o layout', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, layout))

    await expect(getRoomLayout('sala-1')).resolves.toEqual(layout)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/mapa/api/layouts/salas/sala-1`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getRoomLayout('missing')).rejects.toMatchObject({ kind: 'not_found' })
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(getRoomLayout('sala-1')).rejects.toMatchObject({ kind: 'forbidden' })
  })

  it('mapeia erro de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(getRoomLayout('sala-1')).rejects.toMatchObject({ kind: 'network' })
  })
})
