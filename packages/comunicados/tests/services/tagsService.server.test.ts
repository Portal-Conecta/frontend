/**
 * Testes do service server de tags (`services/server/tagsService`, #406).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@portal/core/auth/session', () => ({
  getSession: () => Promise.resolve('jwt-token'),
}))

import { listTags } from '../../src/services/server/tagsService'

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

describe('listTags', () => {
  it('usa next.revalidate/tags pra Data Cache do catálogo (#406)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, []))

    await listTags()

    const [, init] = fetchMock.mock.calls[0]!
    expect(init).toMatchObject({ next: { revalidate: 120, tags: ['comunicados-tags'] } })
    expect(init).not.toHaveProperty('cache')
  })
})
