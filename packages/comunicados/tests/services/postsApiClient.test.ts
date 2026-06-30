import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ComunicadosApiError } from '@portal/comunicados/services/errors'
import { postsApiClient } from '@portal/comunicados/services/server/postsApiClient'

const API_URL = 'https://comunicados.test'

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

const listResponse = {
  items: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Comunicado teste',
      description: 'Descrição',
      origin: 'SENAI',
      status: 'PUBLISHED',
      pinned: false,
      pinnedOrder: null,
      scheduledFor: null,
      publishedAt: '2026-01-15T10:00:00Z',
      createdAt: '2026-01-15T09:00:00Z',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

beforeEach(() => {
  process.env.COMUNICADOS_API_URL = API_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.COMUNICADOS_API_URL
})

describe('postsApiClient.get', () => {
  it('chama GET /api/posts com Bearer e query params', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, listResponse))

    await expect(
      postsApiClient.get('/api/posts', {
        token: 'jwt-token',
        params: { page: 0, size: 20, search: 'retirada' },
      }),
    ).resolves.toEqual(listResponse)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_URL}/api/posts?page=0&size=20&search=retirada`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({
      Authorization: 'Bearer jwt-token',
      'Content-Type': 'application/json',
    })
  })

  it('mapeia 401 para ComunicadosApiError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(postsApiClient.get('/api/posts', { token: 'x' })).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 403 para ComunicadosApiError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(postsApiClient.get('/api/posts', { token: 'x' })).rejects.toMatchObject({
      kind: 'forbidden',
    })
  })

  it('mapeia 404 para ComunicadosApiError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(postsApiClient.get('/api/posts/1', { token: 'x' })).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('mapeia falha de rede para ComunicadosApiError network preservando cause', async () => {
    const networkError = new TypeError('fetch failed')
    stubFetch().mockRejectedValue(networkError)

    await expect(postsApiClient.get('/api/posts', { token: 'x' })).rejects.toBeInstanceOf(
      ComunicadosApiError,
    )

    const error = await postsApiClient.get('/api/posts', { token: 'x' }).catch((e) => e)
    expect(error).toMatchObject({ kind: 'network' })
    expect(error.cause).toBe(networkError)
  })

  it('falha quando COMUNICADOS_API_URL não está configurada', async () => {
    delete process.env.COMUNICADOS_API_URL
    await expect(postsApiClient.get('/api/posts', { token: 'x' })).rejects.toMatchObject({
      kind: 'server',
    })
  })
})
