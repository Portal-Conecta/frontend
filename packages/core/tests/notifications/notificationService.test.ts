import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationsAsRead,
} from '@portal/core/notifications/notificationService'
import type {
  PagedNotificationsResponse,
  UnreadCountResponse,
} from '@portal/core/notifications/types'

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

const pagedResponse: PagedNotificationsResponse = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
}

const unreadCountResponse: UnreadCountResponse = { unreadCount: 3 }

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('getNotifications', () => {
  it('busca pelo gateway sob /hub com status, page e size', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pagedResponse))

    await expect(
      getNotifications(TOKEN, { status: 'UNREAD', page: 2, size: 10 }),
    ).resolves.toEqual(pagedResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/notifications?status=UNREAD&page=2&size=10`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
  })

  it('usa page 0 e size 20 como defaults', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, pagedResponse))

    await getNotifications(TOKEN, { status: 'READ' })

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/notifications?status=READ&page=0&size=20`)
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(getNotifications(TOKEN, { status: 'UNREAD' })).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 400 para HttpError validation', async () => {
    stubFetch().mockResolvedValue(response(400, {}))
    await expect(getNotifications(TOKEN, { status: 'UNREAD' })).rejects.toMatchObject({
      kind: 'validation',
    })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))
    await expect(getNotifications(TOKEN, { status: 'UNREAD' })).rejects.toMatchObject({
      kind: 'server',
    })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))
    const error = await getNotifications(TOKEN, { status: 'UNREAD' }).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})

describe('markNotificationsAsRead', () => {
  it('faz PATCH em lote com os notificationIds no corpo e resolve em 204', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(204, null))

    await expect(markNotificationsAsRead(TOKEN, ['uuid-a', 'uuid-b'])).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/notifications/read`)
    expect(init?.method).toBe('PATCH')
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(init?.body as string)).toEqual({
      notificationIds: ['uuid-a', 'uuid-b'],
    })
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(markNotificationsAsRead(TOKEN, ['uuid-a'])).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(markNotificationsAsRead(TOKEN, ['uuid-a'])).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })
})

describe('getUnreadNotificationsCount', () => {
  it('busca a contagem pelo gateway sob /hub e resolve o unreadCount', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, unreadCountResponse))

    await expect(getUnreadNotificationsCount(TOKEN)).resolves.toEqual(unreadCountResponse)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/notifications/unread-count`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(getUnreadNotificationsCount(TOKEN)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))
    await expect(getUnreadNotificationsCount(TOKEN)).rejects.toMatchObject({
      kind: 'server',
    })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))
    const error = await getUnreadNotificationsCount(TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})
