import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'
import { createHttpClient } from '@portal/core/http/httpClient'

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
  items: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
}

beforeEach(() => {
  process.env.COMUNICADOS_API_URL = API_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.COMUNICADOS_API_URL
})

describe('createHttpClient', () => {
  it('chama GET com Bearer e query params', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, listResponse))
    const http = createHttpClient('COMUNICADOS_API_URL')

    await expect(
      http.get('/api/posts', {
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

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    const http = createHttpClient('COMUNICADOS_API_URL')
    await expect(http.get('/api/posts', { token: 'x' })).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    const http = createHttpClient('COMUNICADOS_API_URL')
    await expect(http.get('/api/posts', { token: 'x' })).rejects.toMatchObject({
      kind: 'forbidden',
    })
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    const http = createHttpClient('COMUNICADOS_API_URL')
    await expect(http.get('/api/posts/1', { token: 'x' })).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('mapeia falha de rede para HttpError network preservando cause', async () => {
    const networkError = new TypeError('fetch failed')
    stubFetch().mockRejectedValue(networkError)
    const http = createHttpClient('COMUNICADOS_API_URL')

    const error = await http.get('/api/posts', { token: 'x' }).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
    expect(error.cause).toBe(networkError)
  })

  it('falha quando a env de base URL não está configurada', async () => {
    delete process.env.COMUNICADOS_API_URL
    const http = createHttpClient('COMUNICADOS_API_URL')
    await expect(http.get('/api/posts', { token: 'x' })).rejects.toMatchObject({
      kind: 'server',
    })
  })
})
