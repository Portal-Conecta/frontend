import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createClass,
  getClassDetail,
  listClasses,
} from '@portal/core/classes/classesService'
import type { ClassSummary } from '@portal/core/classes/types'
import { HttpError } from '@portal/core/http/errors'

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

function makeClass(id: string, overrides: Partial<ClassSummary> = {}): ClassSummary {
  return {
    id,
    name: `Turma ${id}`,
    number: 1,
    shift: 'FULL_AM_PM',
    courseId: 'c1',
    active: true,
    ...overrides,
  }
}

function classesPage(items: ClassSummary[], page: number, totalPages: number) {
  return response(200, { items, page, size: 100, totalElements: items.length, totalPages })
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('listClasses', () => {
  it('busca turmas no gateway sob /hub/classes com o token', async () => {
    const classes = [makeClass('t1'), makeClass('t2')]
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(classesPage(classes, 0, 1))

    await expect(listClasses(TOKEN)).resolves.toEqual({ classes })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toContain(`${API_GATEWAY_URL}/hub/classes`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    // Só ativas por padrão: sem includeInactive na query.
    expect(String(url)).not.toContain('includeInactive')
  })

  it('filtra por nome (substring, case-insensitive)', async () => {
    const classes = [
      makeClass('t1', { name: 'DEV-01 78' }),
      makeClass('t2', { name: 'RED-02 12' }),
    ]
    stubFetch().mockResolvedValue(classesPage(classes, 0, 1))

    await expect(listClasses(TOKEN, { search: 'dev' })).resolves.toEqual({
      classes: [classes[0]],
    })
  })

  it('filtra por curso e por turno', async () => {
    const classes = [
      makeClass('t1', { courseId: 'c1', shift: 'FULL_AM_PM' }),
      makeClass('t2', { courseId: 'c2', shift: 'FULL_PM_NT' }),
      makeClass('t3', { courseId: 'c1', shift: 'FULL_PM_NT' }),
    ]
    stubFetch().mockResolvedValue(classesPage(classes, 0, 1))

    await expect(listClasses(TOKEN, { courseId: 'c1' })).resolves.toEqual({
      classes: [classes[0], classes[2]],
    })
    await expect(listClasses(TOKEN, { courseId: 'c1', shift: 'FULL_PM_NT' })).resolves.toEqual({
      classes: [classes[2]],
    })
  })

  it('inclui inativas quando includeInactive é pedido', async () => {
    const classes = [makeClass('t1', { active: false })]
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(classesPage(classes, 0, 1))

    await expect(listClasses(TOKEN, { includeInactive: true })).resolves.toEqual({ classes })
    expect(String(fetchMock.mock.calls[0]![0])).toContain('includeInactive=true')
  })

  it('percorre todas as páginas de /hub/classes', async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => makeClass(`a${i}`))
    const secondPage = [makeClass('b0')]

    const fetchMock = stubFetch()
    fetchMock.mockImplementation(async (input) => {
      const page = new URL(String(input)).searchParams.get('page')
      return page === '0' ? classesPage(firstPage, 0, 2) : classesPage(secondPage, 1, 2)
    })

    const result = await listClasses(TOKEN)
    expect(result.classes).toHaveLength(101)
    const calls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/hub/classes'))
    expect(calls).toHaveLength(2)
    expect(String(calls[0]![0])).toContain('page=0')
    expect(String(calls[1]![0])).toContain('page=1')
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(listClasses(TOKEN)).rejects.toMatchObject({ kind: 'unauthorized' })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))
    const error = await listClasses(TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})

describe('getClassDetail', () => {
  it('busca a turma em /hub/classes/{classId}', async () => {
    const detail = {
      id: 't1',
      shift: 'FULL_AM_PM',
      number: 78,
      name: 'DEV-01 78',
      active: true,
      courseId: 'c1',
      createdAt: '2026-07-14T00:00:00Z',
    }
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, detail))

    await expect(getClassDetail('t1', TOKEN)).resolves.toEqual(detail)
    expect(String(fetchMock.mock.calls[0]![0])).toBe(`${API_GATEWAY_URL}/hub/classes/t1`)
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(getClassDetail('missing', TOKEN)).rejects.toMatchObject({ kind: 'not_found' })
  })
})

describe('createClass', () => {
  it('faz POST em /hub/classes com o payload', async () => {
    const created = {
      id: 'new-1',
      shift: 'FULL_AM_PM',
      number: 78,
      name: 'DEV-01 78',
      courseId: 'c1',
      createdAt: '2026-07-14T00:00:00Z',
    }
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, created))

    await expect(
      createClass({ courseId: 'c1', number: 78, shift: 'FULL_AM_PM' }, TOKEN),
    ).resolves.toEqual(created)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/classes`)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      courseId: 'c1',
      number: 78,
      shift: 'FULL_AM_PM',
    })
  })

  it('propaga 409 (número duplicado no curso) preservando status e mensagem', async () => {
    stubFetch().mockResolvedValue(
      response(409, { message: 'Já existe turma com esse número neste curso.' }),
    )

    const error = await createClass({ courseId: 'c1', number: 78, shift: 'FULL_AM_PM' }, TOKEN).catch(
      (e) => e,
    )
    expect(error).toBeInstanceOf(HttpError)
    expect(error.status).toBe(409)
    expect(error.body?.message).toBe('Já existe turma com esse número neste curso.')
  })

  it('mapeia 404 (curso inexistente) para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(
      createClass({ courseId: 'missing', number: 1, shift: 'FULL_AM_PM' }, TOKEN),
    ).rejects.toMatchObject({ kind: 'not_found' })
  })
})
