import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpError } from '@portal/core/http/errors'
import {
  createUser,
  deactivateUser,
  deleteUser,
  getMyCourses,
  getMyProfile,
  getUserById,
  reactivateUser,
  updateUser,
} from '@portal/core/profile/profileService'
import type {
  CreateUserPayload,
  MyListCourseResponse,
  MyProfile,
  UpdateUserPayload,
  UserById,
  UserLifecycleResult,
} from '@portal/core/profile/types'

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

  it('codifica o id antes de compor o caminho do gateway', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, userByIdResponse))

    await getUserById('id?filter=admin', TOKEN)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/users/id%3Ffilter%3Dadmin`)
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

describe('createUser', () => {
  it('envia a criação para /hub/users com o token e payload', async () => {
    const fetchMock = stubFetch()
    const payload: CreateUserPayload = {
      name: 'Carlos Lima',
      email: 'carlos.lima@example.com',
      typeUser: 'TEACHER',
    }
    fetchMock.mockResolvedValue(response(201, userByIdResponse))

    await expect(createUser(payload, TOKEN)).resolves.toEqual(userByIdResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/users`)
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.body).toBe(JSON.stringify(payload))
  })
})

describe('updateUser', () => {
  it('envia somente os campos atualizados para /hub/users/{id}', async () => {
    const fetchMock = stubFetch()
    const payload: UpdateUserPayload = { name: 'Carlos Souza' }
    fetchMock.mockResolvedValue(response(200, { ...userByIdResponse, ...payload }))

    await expect(updateUser(userByIdResponse.id, payload, TOKEN)).resolves.toMatchObject(payload)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/users/${userByIdResponse.id}`)
    expect(init?.method).toBe('PATCH')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.body).toBe(JSON.stringify(payload))
  })
})

const lifecycleResponse: UserLifecycleResult = {
  id: userByIdResponse.id,
  accountStatus: 'DISABLED',
  deletedAt: null,
}

describe('deactivateUser', () => {
  it('envia POST para /hub/users/{id}/deactivate', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, lifecycleResponse))

    await expect(deactivateUser(userByIdResponse.id, TOKEN)).resolves.toEqual(lifecycleResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/users/${userByIdResponse.id}/deactivate`)
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))

    await expect(deactivateUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))

    await expect(deactivateUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))

    await expect(deactivateUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'server',
    })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const error = await deactivateUser(userByIdResponse.id, TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})

describe('reactivateUser', () => {
  it('envia POST para /hub/users/{id}/reactivate', async () => {
    const fetchMock = stubFetch()
    const activeResponse: UserLifecycleResult = { ...lifecycleResponse, accountStatus: 'ACTIVE' }
    fetchMock.mockResolvedValue(response(200, activeResponse))

    await expect(reactivateUser(userByIdResponse.id, TOKEN)).resolves.toEqual(activeResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/users/${userByIdResponse.id}/reactivate`)
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))

    await expect(reactivateUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))

    await expect(reactivateUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))

    await expect(reactivateUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'server',
    })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const error = await reactivateUser(userByIdResponse.id, TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})

describe('deleteUser', () => {
  it('envia DELETE para /hub/users/{id}', async () => {
    const fetchMock = stubFetch()
    const pendingDeletionResponse: UserLifecycleResult = {
      ...lifecycleResponse,
      accountStatus: 'PENDING_DELETION',
      deletedAt: '2026-07-22T12:00:00.000Z',
    }
    fetchMock.mockResolvedValue(response(200, pendingDeletionResponse))

    await expect(deleteUser(userByIdResponse.id, TOKEN)).resolves.toEqual(pendingDeletionResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/users/${userByIdResponse.id}`)
    expect(init?.method).toBe('DELETE')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))

    await expect(deleteUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))

    await expect(deleteUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))

    await expect(deleteUser(userByIdResponse.id, TOKEN)).rejects.toMatchObject({
      kind: 'server',
    })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))

    const error = await deleteUser(userByIdResponse.id, TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})
