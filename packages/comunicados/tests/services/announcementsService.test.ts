/**
 * Testes do service server de comunicados (`services/server/announcementsService`).
 *
 * As funções falam com o back pelo http client compartilhado, que resolve o JWT
 * via `getSession` — então mockamos esse módulo para não depender de `next/headers`
 * e trocamos o `fetch` global por um dublê (`vi.stubGlobal`) para controlar status
 * e corpo. `COMUNICADOS_API_URL` é setada antes de cada teste e limpa depois.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@portal/core/auth/session', () => ({
  getSession: () => Promise.resolve('jwt-token'),
}))

import {
  deleteAnnouncement,
  listMyAnnouncements,
  pinAnnouncement,
  unpinAnnouncement,
} from '../../src/services/server/announcementsService'
import type { AnnouncementResponse } from '../../src/types/announcement'

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

const announcement: AnnouncementResponse = {
  id: 'a1',
  title: 'Título',
  description: 'Descrição',
  origin: 'SENAI',
  status: 'PUBLISHED',
  pinned: true,
  pinnedOrder: 1,
  createdByUserId: 'u1',
  publishedByUserId: 'u1',
  scheduledFor: null,
  publishedAt: '2026-01-01T00:00:00.000Z',
  removedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  process.env.COMUNICADOS_API_URL = API_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.COMUNICADOS_API_URL
})

describe('listMyAnnouncements', () => {
  it('faz GET em /api/posts com mine=true e Bearer, repassando os filtros como query', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, listResponse))

    await expect(listMyAnnouncements({ page: 0, size: 20, search: 'prova' })).resolves.toEqual(
      listResponse,
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_URL}/api/posts?page=0&size=20&search=prova&mine=true`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(listMyAnnouncements()).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('deleteAnnouncement', () => {
  it('faz DELETE em /api/posts/{id} e resolve sem corpo no 204', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(204, null))

    await expect(deleteAnnouncement('a1')).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_URL}/api/posts/a1`)
    expect(init?.method).toBe('DELETE')
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(deleteAnnouncement('missing')).rejects.toMatchObject({ kind: 'not_found' })
  })
})

describe('pinAnnouncement / unpinAnnouncement', () => {
  it('faz PATCH em /api/posts/{id}/pin com pinnedOrder no body e retorna o atualizado', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, announcement))

    await expect(pinAnnouncement('a1', 2)).resolves.toMatchObject({ pinned: true })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_URL}/api/posts/a1/pin`)
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ pinnedOrder: 2 })
  })

  it('faz PATCH em /api/posts/{id}/unpin', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, { ...announcement, pinned: false, pinnedOrder: null }))

    await expect(unpinAnnouncement('a1')).resolves.toMatchObject({ pinned: false })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_URL}/api/posts/a1/unpin`)
    expect(init?.method).toBe('PATCH')
  })
})
