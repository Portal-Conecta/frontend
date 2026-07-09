/**
 * Testes do service server de posts (`services/server/postsService`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@portal/core/auth/session', () => ({
  getSession: () => Promise.resolve('jwt-token'),
}))

import {
  deletePost,
  getAnnouncement,
  getPostImages,
  getPostTags,
  listMyPosts,
  listPosts,
  pinPost,
  unpinPost,
} from '../../src/services/server/postsService'
import type { AnnouncementResponse } from '../../src/types/announcement'

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

const listResponse = {
  items: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
}

const post: AnnouncementResponse = {
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
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('listMyPosts', () => {
  it('faz GET em /api/posts com mine=true e Bearer, repassando os filtros como query', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, listResponse))

    await expect(listMyPosts({ page: 0, size: 20, search: 'prova' })).resolves.toEqual(listResponse)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts?page=0&size=20&search=prova&mine=true`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(listMyPosts()).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('deletePost', () => {
  it('faz DELETE em /api/posts/{id} e resolve sem corpo no 204', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(204, null))

    await expect(deletePost('a1')).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/a1`)
    expect(init?.method).toBe('DELETE')
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(deletePost('missing')).rejects.toMatchObject({ kind: 'not_found' })
  })
})

describe('pinPost / unpinPost', () => {
  it('faz PATCH em /api/posts/{id}/pin com pinnedOrder no body e retorna o atualizado', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, post))

    await expect(pinPost('a1', 2)).resolves.toMatchObject({ pinned: true })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/a1/pin`)
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ pinnedOrder: 2 })
  })

  it('faz PATCH em /api/posts/{id}/unpin', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, { ...post, pinned: false, pinnedOrder: null }))

    await expect(unpinPost('a1')).resolves.toMatchObject({ pinned: false })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/a1/unpin`)
    expect(init?.method).toBe('PATCH')
  })
})

describe('listPosts', () => {
  it('faz GET em /api/posts com paginação', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, listResponse))

    await expect(listPosts({ page: 0, size: 20 })).resolves.toEqual(listResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts?page=0&size=20`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })
})

describe('getAnnouncement', () => {
  it('retorna o detalhe e faz GET para /api/posts/:id', async () => {
    const fetchMock = stubFetch()
    const detailMock = { announcement: { id: 'a1' }, tags: [], files: [], destinations: [], mentions: [] }
    fetchMock.mockResolvedValue(response(200, detailMock))

    await expect(getAnnouncement('a1')).resolves.toEqual(detailMock)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/a1`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getAnnouncement('missing')).rejects.toMatchObject({ kind: 'not_found' })
  })
})

describe('getPostTags', () => {
  it('retorna a lista de tags e faz GET para /api/posts/:id/tags', async () => {
    const fetchMock = stubFetch()
    const tagsMock = [{ announcementId: 'a1', tagId: 't1', tagName: 'Tag 1' }]
    fetchMock.mockResolvedValue(response(200, tagsMock))

    await expect(getPostTags('a1')).resolves.toEqual(tagsMock)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/a1/tags`)
    expect(init?.method).toBe('GET')
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(getPostTags('a1')).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('getPostImages', () => {
  it('retorna a lista de imagens e faz GET para /api/posts/:id/images', async () => {
    const fetchMock = stubFetch()
    const imagesMock = [{ id: 'f1', announcementId: 'a1', originalName: 'img.png' }]
    fetchMock.mockResolvedValue(response(200, imagesMock))

    await expect(getPostImages('a1')).resolves.toEqual(imagesMock)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/a1/images`)
    expect(init?.method).toBe('GET')
  })

  it('mapeia erro de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(getPostImages('a1')).rejects.toMatchObject({ kind: 'network' })
  })
})
