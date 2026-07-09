/**
 * Testes do service client de posts (`services/client/postsClient`).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  deletePostClient,
  getPostDetailClient,
  getPostImagesClient,
  getPostTagsClient,
  listPostsClient,
  listMyPostsClient,
  loadAnnouncementClient,
  pinPostClient,
  rescheduleAnnouncementClient,
  unpinPostClient,
  updateAnnouncementClient,
} from '../../src/services/client/postsClient'

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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('listPostsClient / listMyPostsClient', () => {
  it('lista o mural em GET /api/comunicados/posts com a query montada', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, listResponse))

    await expect(listPostsClient({ page: 0, size: 20 })).resolves.toEqual(listResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts?page=0&size=20')
    expect(init?.method).toBeUndefined()
  })

  it('lista os próprios em GET /api/comunicados/posts/mine', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, listResponse))

    await expect(listMyPostsClient({ search: 'prova' })).resolves.toEqual(listResponse)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/mine?search=prova')
  })
})

describe('loadAnnouncementClient / updateAnnouncementClient / rescheduleAnnouncementClient', () => {
  it('carrega detalhe em GET /api/comunicados/posts/:id', async () => {
    const fetchMock = stubFetch()
    const detail = { announcement: { id: '1', title: 'Olá' } }
    fetchMock.mockResolvedValue(response(200, detail))

    await expect(loadAnnouncementClient('1')).resolves.toEqual(detail)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/1')
    expect(init?.method).toBeUndefined()
  })

  it('atualiza comunicado em PUT /api/comunicados/posts/:id', async () => {
    const fetchMock = stubFetch()
    const detail = { announcement: { id: '1', title: 'Novo título' } }
    fetchMock.mockResolvedValue(response(200, detail))

    await updateAnnouncementClient('1', { title: 'Novo título' })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/1')
    expect(init?.method).toBe('PUT')
    expect(JSON.parse(init?.body as string)).toEqual({ title: 'Novo título' })
  })

  it('reagenda comunicado em PATCH /api/comunicados/posts/:id/schedule', async () => {
    const fetchMock = stubFetch()
    const detail = { announcement: { id: '1', status: 'SCHEDULED' } }
    fetchMock.mockResolvedValue(response(200, detail))

    await rescheduleAnnouncementClient('1', '2026-07-10T10:00:00.000Z')

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/1/schedule')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ scheduledFor: '2026-07-10T10:00:00.000Z' })
  })
})

describe('deletePostClient', () => {
  it('faz DELETE e resolve sem corpo no 204', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(204, null))

    await expect(deletePostClient('a1')).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/a1')
    expect(init?.method).toBe('DELETE')
  })

  it('mapeia 403 para HttpError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(deletePostClient('a1')).rejects.toMatchObject({ kind: 'forbidden' })
  })
})

describe('pinPostClient / unpinPostClient', () => {
  it('faz PATCH em /pin com pinnedOrder no body', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, { id: 'a1', pinned: true }))

    await expect(pinPostClient('a1', 2)).resolves.toMatchObject({ pinned: true })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/a1/pin')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ pinnedOrder: 2 })
  })

  it('faz PATCH em /unpin', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, { id: 'a1', pinned: false }))

    await expect(unpinPostClient('a1')).resolves.toMatchObject({ pinned: false })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/a1/unpin')
    expect(init?.method).toBe('PATCH')
  })
})

describe('getPostDetailClient / getPostTagsClient / getPostImagesClient', () => {
  it('busca detalhe em GET /api/comunicados/posts/:id', async () => {
    const fetchMock = stubFetch()
    const detailMock = { announcement: { id: 'a1' }, tags: [], files: [], destinations: [], mentions: [] }
    fetchMock.mockResolvedValue(response(200, detailMock))

    await expect(getPostDetailClient('a1')).resolves.toEqual(detailMock)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/a1')
  })

  it('busca tags em GET /api/comunicados/posts/:id/tags', async () => {
    const fetchMock = stubFetch()
    const tagsMock = [{ announcementId: 'a1', tagId: 't1', tagName: 'Tag 1' }]
    fetchMock.mockResolvedValue(response(200, tagsMock))

    await expect(getPostTagsClient('a1')).resolves.toEqual(tagsMock)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/a1/tags')
  })

  it('busca imagens em GET /api/comunicados/posts/:id/images', async () => {
    const fetchMock = stubFetch()
    const imagesMock = [{ id: 'f1', announcementId: 'a1', originalName: 'img.png' }]
    fetchMock.mockResolvedValue(response(200, imagesMock))

    await expect(getPostImagesClient('a1')).resolves.toEqual(imagesMock)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/comunicados/posts/a1/images')
  })

  it('mapeia 404 do detalhe para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getPostDetailClient('missing')).rejects.toMatchObject({ kind: 'not_found' })
  })
})
