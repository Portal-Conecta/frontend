import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'
import { getMyCourses, getMyProfile, getUserById } from '@portal/core/profile/profileService'
import type { MyListCourseResponse, MyProfile, UserById } from '@portal/core/profile/types'

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

const userByIdResponse: UserById = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Carlos Lima',
  email: 'carlos.lima@example.com',
  typeUser: 'TEACHER',
  active: true,
  createdAt: '2026-01-10T12:00:00.000Z',
}

describe('getUserById', () => {
  it('busca o usuario pelo gateway sob /hub/users/{userId}', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, userByIdResponse))

    await expect(getUserById(userByIdResponse.id, TOKEN)).resolves.toEqual(userByIdResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/users/${userByIdResponse.id}`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.cache).toBe('no-store')
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))

    await expect(getUserById(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))

    await expect(getUserById(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })
})
