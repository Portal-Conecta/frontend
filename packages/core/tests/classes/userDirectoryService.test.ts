import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { searchUsers } from '@portal/core/classes/userDirectoryService'
import type { ListUsersResponse } from '@portal/core/classes/types'

const API_GATEWAY_URL = 'https://gateway.test'
const TOKEN = 'jwt-token'

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

const page: ListUsersResponse = {
  content: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Carlos Lima',
      email: 'carlos.lima@example.com',
      typeUser: 'TEACHER',
      active: true,
      createdAt: '2026-01-10T12:00:00.000Z',
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

describe('searchUsers', () => {
  it('busca usuários sob /hub/users repassando page/size/typeUser como query', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, page))

    await expect(
      searchUsers({ page: 0, size: 20, typeUser: 'TEACHER' }, TOKEN),
    ).resolves.toEqual(page)

    const [url, init] = fetchMock.mock.calls[0]!
    const parsed = new URL(url as string)
    expect(parsed.pathname).toBe('/hub/users')
    expect(parsed.searchParams.get('page')).toBe('0')
    expect(parsed.searchParams.get('size')).toBe('20')
    expect(parsed.searchParams.get('typeUser')).toBe('TEACHER')
    expect(init?.method).toBe('GET')
  })

  it('omite typeUser da query quando não informado', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, page))

    await searchUsers({ page: 0, size: 20 }, TOKEN)

    const [url] = fetchMock.mock.calls[0]!
    expect(new URL(url as string).searchParams.has('typeUser')).toBe(false)
  })

  it('mapeia 403 (sem permissão para listar) para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))

    await expect(searchUsers({}, TOKEN)).rejects.toMatchObject({ kind: 'forbidden' })
  })
})
