import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'
import { getMyCourses, getMyProfile } from '@portal/core/profile/profileService'
import type { MyListCourseResponse, MyProfile } from '@portal/core/profile/types'

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

const profileResponse: MyProfile = {
  id: 'user-id',
  name: 'Ana Souza',
  email: 'ana.souza@example.com',
  typeUser: 'STUDENT',
  avatarUrl: null,
}

const coursesResponse: MyListCourseResponse = {
  courses: [
    {
      id: 'course-id',
      name: 'Desenvolvimento de Sistemas',
      code: 'DS',
      classes: [
        {
          id: 'class-id',
          name: 'DS 2026',
          number: 2026,
          shift: 'FULL_AM_PM',
          classRole: 'STUDENT',
        },
      ],
    },
  ],
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('getMyProfile', () => {
  it('busca o perfil autenticado pelo gateway sob /hub/me', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, profileResponse))

    await expect(getMyProfile(TOKEN)).resolves.toEqual(profileResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/me`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.cache).toBe('no-store')
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))

    await expect(getMyProfile(TOKEN)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))

    await expect(getMyProfile(TOKEN)).rejects.toMatchObject({
      kind: 'server',
    })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const error = await getMyProfile(TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})

describe('getMyCourses', () => {
  it('busca os cursos do usuario autenticado pelo gateway sob /hub/me/courses', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, coursesResponse))

    await expect(getMyCourses(TOKEN)).resolves.toEqual(coursesResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/me/courses`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.cache).toBe('no-store')
  })

  it('preserva courses vazio quando o usuario nao tem vinculos', async () => {
    const emptyResponse: MyListCourseResponse = { courses: [] }
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, emptyResponse))

    await expect(getMyCourses(TOKEN)).resolves.toEqual(emptyResponse)
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))

    await expect(getMyCourses(TOKEN)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))

    await expect(getMyCourses(TOKEN)).rejects.toMatchObject({
      kind: 'server',
    })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const error = await getMyCourses(TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})
