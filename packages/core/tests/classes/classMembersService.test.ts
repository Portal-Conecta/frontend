import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  addClassMember,
  listClassMembers,
  removeClassMember,
  setClassRepresentative,
} from '@portal/core/classes/classMembersService'
import type {
  AddMemberResponse,
  ClassMember,
  MemberRoleResponse,
} from '@portal/core/classes/types'
import { HttpError } from '@portal/core/http/errors'

const API_GATEWAY_URL = 'https://gateway.test'
const TOKEN = 'jwt-token'
const CLASS_ID = '550e8400-e29b-41d4-a716-446655440000'
const USER_ID = '987e6543-e21b-34d5-c678-426614174999'

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

describe('listClassMembers', () => {
  const members: ClassMember[] = [
    { id: 'a1', name: 'Ana Souza', role: 'STUDENT' },
    { id: 'b2', name: 'Bruno Dias', role: 'REPRESENTATIVE' },
  ]

  it('filtra por papel via ?role= sob /hub/classes/{classId}/members', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, members))

    await expect(listClassMembers(CLASS_ID, 'STUDENT', TOKEN)).resolves.toEqual(members)

    const [url, init] = fetchMock.mock.calls[0]!
    const parsed = new URL(url as string)
    expect(parsed.pathname).toBe(`/hub/classes/${CLASS_ID}/members`)
    expect(parsed.searchParams.get('role')).toBe('STUDENT')
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
  })

  it('sem papel, não envia query (backend retorna todos os membros)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, members))

    await expect(listClassMembers(CLASS_ID, undefined, TOKEN)).resolves.toEqual(members)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/classes/${CLASS_ID}/members`)
  })

  it('mapeia 404 (turma inexistente) para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))

    await expect(listClassMembers(CLASS_ID, 'STUDENT', TOKEN)).rejects.toMatchObject({
      kind: 'not_found',
    })
  })
})

describe('addClassMember', () => {
  it('vincula usuário via POST com userId e classRole no corpo', async () => {
    const body: AddMemberResponse = {
      userId: USER_ID,
      classId: CLASS_ID,
      classRole: 'STUDENT',
    }
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, body))

    await expect(
      addClassMember(CLASS_ID, { userId: USER_ID, classRole: 'STUDENT' }, TOKEN),
    ).resolves.toEqual(body)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/classes/${CLASS_ID}/members`)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      userId: USER_ID,
      classRole: 'STUDENT',
    })
  })

  it('propaga 400 (vínculo duplicado) como HttpError validation', async () => {
    stubFetch().mockResolvedValue(response(400, { message: 'usuário já é membro' }))

    await expect(
      addClassMember(CLASS_ID, { userId: USER_ID, classRole: 'STUDENT' }, TOKEN),
    ).rejects.toMatchObject({ kind: 'validation' })
  })
})

describe('removeClassMember', () => {
  it('desvincula via DELETE e resolve vazio no 204', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(204, undefined))

    await expect(removeClassMember(CLASS_ID, USER_ID, TOKEN)).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/classes/${CLASS_ID}/members/${USER_ID}`)
    expect(init?.method).toBe('DELETE')
  })
})

describe('setClassRepresentative', () => {
  const promoted: MemberRoleResponse = {
    userId: USER_ID,
    classId: CLASS_ID,
    classRole: 'REPRESENTATIVE',
    userType: 'REPRESENTATIVE',
  }

  it('promove com PATCH quando representative = true', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, promoted))

    await expect(
      setClassRepresentative(CLASS_ID, USER_ID, true, TOKEN),
    ).resolves.toEqual(promoted)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(
      `${API_GATEWAY_URL}/hub/classes/${CLASS_ID}/members/${USER_ID}/representative`,
    )
    expect(init?.method).toBe('PATCH')
  })

  it('rebaixa com DELETE quando representative = false', async () => {
    const demoted: MemberRoleResponse = { ...promoted, classRole: 'STUDENT', userType: 'STUDENT' }
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, demoted))

    await expect(
      setClassRepresentative(CLASS_ID, USER_ID, false, TOKEN),
    ).resolves.toEqual(demoted)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(
      `${API_GATEWAY_URL}/hub/classes/${CLASS_ID}/members/${USER_ID}/representative`,
    )
    expect(init?.method).toBe('DELETE')
  })

  it('propaga o 400 do limite de 2 representantes (validado no backend)', async () => {
    stubFetch().mockResolvedValue(
      response(400, { message: 'limite de representantes atingido' }),
    )

    const error = await setClassRepresentative(CLASS_ID, USER_ID, true, TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({
      kind: 'validation',
      body: { message: 'limite de representantes atingido' },
    })
  })
})
