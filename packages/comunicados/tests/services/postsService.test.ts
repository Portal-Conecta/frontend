/**
 * Testes do postsService — lógica pura que fala com o back de comunicados via
 * `fetch`. Sem React nem `next/headers`, então rodam em ambiente `node`.
 *
 * Trocamos o `fetch` global por um dublê (`vi.stubGlobal`) para controlar status
 * HTTP e corpo sem servidor, e setamos `COMUNICADOS_API_URL` antes de cada teste
 * (limpando depois, para não vazar estado).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PostsError,
  publishPost,
  schedulePost,
  getPostDetail,
  getPostTags,
  getPostImages,
} from '../../src/services/postsService'
import type {
  AnnouncementResponse,
  PublishAnnouncementRequest,
  ScheduleAnnouncementRequest,
} from '../../src/types'

const COMUNICADOS_API_URL = 'https://comunicados.test'
const TOKEN = 'jwt-token'

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function brokenJsonResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token')
    },
  } as unknown as Response
}

function stubFetch() {
  const mock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', mock)
  return mock
}

const publishBody: PublishAnnouncementRequest = {
  title: 'Título',
  description: 'Descrição',
  origin: 'SENAI',
  destinations: [{ type: 'GENERAL' }],
  pinned: false,
  tagIds: [],
}

const scheduleBody: ScheduleAnnouncementRequest = {
  ...publishBody,
  scheduledFor: '2999-12-31T10:00:00.000Z',
}

const announcement: AnnouncementResponse = {
  id: 'a1',
  title: 'Título',
  description: 'Descrição',
  origin: 'SENAI',
  status: 'PUBLISHED',
  pinned: false,
  pinnedOrder: null,
  createdByUserId: 'u1',
  publishedByUserId: 'u1',
  scheduledFor: null,
  publishedAt: '2026-01-01T00:00:00.000Z',
  removedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  process.env.COMUNICADOS_API_URL = COMUNICADOS_API_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.COMUNICADOS_API_URL
})

describe('publishPost', () => {
  it('retorna o comunicado e envia o body com Bearer para /api/posts/publish', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, announcement))

    await expect(publishPost(publishBody, TOKEN)).resolves.toEqual(announcement)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${COMUNICADOS_API_URL}/api/posts/publish`)
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`)
    expect(JSON.parse(init?.body as string)).toEqual(publishBody)
  })

  it('mapeia 400 para PostsError validation preservando os errors[] por campo', async () => {
    const apiError = {
      status: 400,
      message: 'Requisição inválida.',
      errors: [{ field: 'title', message: 'não deve estar em branco' }],
    }
    stubFetch().mockResolvedValue(response(400, apiError))

    await expect(publishPost(publishBody, TOKEN)).rejects.toMatchObject({
      kind: 'validation',
      status: 400,
      fieldErrors: [{ field: 'title', message: 'não deve estar em branco' }],
    })
  })

  it('mapeia 401 para PostsError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(publishPost(publishBody, TOKEN)).rejects.toMatchObject({ kind: 'unauthorized' })
  })

  it('mapeia 403 para PostsError forbidden', async () => {
    stubFetch().mockResolvedValue(response(403, {}))
    await expect(publishPost(publishBody, TOKEN)).rejects.toMatchObject({ kind: 'forbidden' })
  })

  it('mapeia status inesperado para PostsError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))
    await expect(publishPost(publishBody, TOKEN)).rejects.toMatchObject({ kind: 'server' })
  })

  it('mapeia falha de rede para PostsError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(publishPost(publishBody, TOKEN)).rejects.toMatchObject({ kind: 'network' })
  })

  it('mapeia 201 com JSON inválido para PostsError server', async () => {
    stubFetch().mockResolvedValue(brokenJsonResponse(201))
    await expect(publishPost(publishBody, TOKEN)).rejects.toMatchObject({ kind: 'server' })
  })

  it('lança PostsError server quando COMUNICADOS_API_URL não está configurada', async () => {
    delete process.env.COMUNICADOS_API_URL
    const fetchMock = stubFetch()
    await expect(publishPost(publishBody, TOKEN)).rejects.toBeInstanceOf(PostsError)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('schedulePost', () => {
  it('envia o body com scheduledFor para /api/posts/schedule', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, { ...announcement, status: 'SCHEDULED' }))

    await expect(schedulePost(scheduleBody, TOKEN)).resolves.toMatchObject({ status: 'SCHEDULED' })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${COMUNICADOS_API_URL}/api/posts/schedule`)
    expect(JSON.parse(init?.body as string)).toEqual(scheduleBody)
  })

  it('mapeia 400 (data no passado) para PostsError validation', async () => {
    stubFetch().mockResolvedValue(response(400, { message: 'scheduledFor deve ser futuro' }))
    await expect(schedulePost(scheduleBody, TOKEN)).rejects.toMatchObject({ kind: 'validation' })
  })
})

describe('getPostDetail', () => {
  it('retorna o detalhe do comunicado e faz GET para /api/posts/:id', async () => {
    const fetchMock = stubFetch()
    const detailMock = { announcement: { id: 'a1' }, tags: [], files: [], destinations: [], mentions: [] }
    fetchMock.mockResolvedValue(response(200, detailMock))

    await expect(getPostDetail('a1', TOKEN)).resolves.toEqual(detailMock)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${COMUNICADOS_API_URL}/api/posts/a1`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('mapeia erro de rede para PostsError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(getPostDetail('a1', TOKEN)).rejects.toMatchObject({ kind: 'network' })
  })

  it('mapeia status de erro HTTP para PostsError correspondente', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getPostDetail('a1', TOKEN)).rejects.toMatchObject({ kind: 'server' })
  })
})

describe('getPostTags', () => {
  it('retorna a lista de tags e faz GET para /api/posts/:id/tags', async () => {
    const fetchMock = stubFetch()
    const tagsMock = [{ announcementId: 'a1', tagId: 't1', tagName: 'Tag 1' }]
    fetchMock.mockResolvedValue(response(200, tagsMock))

    await expect(getPostTags('a1', TOKEN)).resolves.toEqual(tagsMock)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${COMUNICADOS_API_URL}/api/posts/a1/tags`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`)
  })
})

describe('getPostImages', () => {
  it('retorna a lista de imagens e faz GET para /api/posts/:id/images', async () => {
    const fetchMock = stubFetch()
    const imagesMock = [{ id: 'f1', announcementId: 'a1', originalName: 'img.png' }]
    fetchMock.mockResolvedValue(response(200, imagesMock))

    await expect(getPostImages('a1', TOKEN)).resolves.toEqual(imagesMock)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${COMUNICADOS_API_URL}/api/posts/a1/images`)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`)
  })
})

