/**
 * Testes do service server de catálogo Hub (`services/server/hubCatalogService`, #406).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { listHubClasses, listHubCourses } from '../../src/services/server/hubCatalogService'

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

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('listHubCourses', () => {
  it('usa next.revalidate/tags pra Data Cache do catálogo (#406)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, { courses: [] }))

    await listHubCourses('jwt-token')

    const [, init] = fetchMock.mock.calls[0]!
    expect(init).toMatchObject({ next: { revalidate: 60, tags: ['hub-courses'] } })
    expect(init).not.toHaveProperty('cache')
  })
})

describe('listHubClasses', () => {
  it('usa next.revalidate/tags pra Data Cache do catálogo (#406)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(
      response(200, { items: [], page: 0, size: 100, totalElements: 0, totalPages: 0 }),
    )

    await listHubClasses('jwt-token')

    const [, init] = fetchMock.mock.calls[0]!
    expect(init).toMatchObject({ next: { revalidate: 60, tags: ['hub-classes'] } })
    expect(init).not.toHaveProperty('cache')
  })
})
