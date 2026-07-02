import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ComunicadosApiError } from '@portal/comunicados/services/server/comunicadosApiClient'
import { listPosts } from '@portal/comunicados/services/server/postsService'

const COMUNICADOS_API_URL = 'https://comunicados.test'

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

beforeEach(() => {
  process.env.COMUNICADOS_API_URL = COMUNICADOS_API_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.COMUNICADOS_API_URL
  delete process.env.API_URL
})

describe('listPosts', () => {
  it('consulta /api/posts com query params e token bearer', async () => {
    const fetchMock = stubFetch()
    const payload = {
      content: [{ id: 1, title: 'Comunicado' }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    }
    fetchMock.mockResolvedValue(response(200, payload))

    await expect(listPosts({ page: 0, size: 10, search: 'mural', status: 'published' }, 'access-token')).resolves.toEqual(
      payload,
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    const requestUrl = new URL(String(url))

    expect(`${requestUrl.origin}${requestUrl.pathname}`).toBe(`${COMUNICADOS_API_URL}/api/posts`)
    expect(requestUrl.searchParams.get('page')).toBe('0')
    expect(requestUrl.searchParams.get('size')).toBe('10')
    expect(requestUrl.searchParams.get('search')).toBe('mural')
    expect(requestUrl.searchParams.get('status')).toBe('published')
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({
      Accept: 'application/json',
      Authorization: 'Bearer access-token',
    })
    expect(init?.cache).toBe('no-store')
  })

  it('mapeia erro do backend para ComunicadosApiError preservando status e code', async () => {
    stubFetch().mockResolvedValue(response(422, { code: 'validation' }))

    await expect(listPosts({ page: 0 }, 'access-token')).rejects.toMatchObject({
      status: 422,
      code: 'validation',
    })
  })

  it('lança erro server quando COMUNICADOS_API_URL e API_URL não estão configuradas', async () => {
    delete process.env.COMUNICADOS_API_URL
    delete process.env.API_URL
    stubFetch()

    await expect(listPosts({ page: 0 }, 'access-token')).rejects.toBeInstanceOf(ComunicadosApiError)
    await expect(listPosts({ page: 0 }, 'access-token')).rejects.toMatchObject({
      status: 503,
      code: 'missing_comunicados_api_url',
    })
  })
})
