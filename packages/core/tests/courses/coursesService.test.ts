import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCourses,
  fetchClassesPage,
  getCourseDetail,
  listCourses,
  updateCourse,
} from '@portal/core/courses/coursesService'
import { HttpError } from '@portal/core/http/errors'
import type { CourseClass } from '@portal/core/courses/types'

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

const courses = [
  { id: 'c1', name: 'Desenvolvimento de Sistemas', code: 'DEV-01' },
  { id: 'c2', name: 'Redes de Computadores', code: 'RED-02' },
]

function makeClass(id: string, courseId: string, overrides: Partial<CourseClass> = {}): CourseClass {
  return { id, name: `Turma ${id}`, number: 1, shift: 'FULL_AM_PM', courseId, active: true, ...overrides }
}

function classesPage(items: CourseClass[], page: number, totalPages: number) {
  return response(200, { items, page, size: 100, totalElements: items.length, totalPages })
}

/** Roteia o mock de fetch por URL, com uma única página de turmas por padrão. */
function routeFetch(classes: CourseClass[] = []) {
  const mock = stubFetch()
  mock.mockImplementation(async (input) => {
    const url = String(input)
    if (url.includes('/hub/courses/')) return response(200, courses[0])
    if (url.includes('/hub/courses')) return response(200, { courses })
    if (url.includes('/hub/classes')) return classesPage(classes, 0, 1)
    throw new Error(`URL inesperada: ${url}`)
  })
  return mock
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('listCourses', () => {
  it('busca cursos no gateway sob /hub/courses com o token', async () => {
    const fetchMock = routeFetch()

    await expect(listCourses(TOKEN)).resolves.toEqual({ courses })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/courses`)
    expect(init?.method).toBe('GET')
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.cache).toBe('no-store')
  })

  it('filtra por nome/código (substring, case-insensitive) sem chamar /hub/classes', async () => {
    const fetchMock = routeFetch()

    await expect(listCourses(TOKEN, { search: 'redes' })).resolves.toEqual({
      courses: [courses[1]],
    })
    await expect(listCourses(TOKEN, { search: 'DEV' })).resolves.toEqual({
      courses: [courses[0]],
    })
    expect(fetchMock.mock.calls.every(([url]) => !String(url).includes('/hub/classes'))).toBe(true)
  })

  it('filtra por turno mantendo só cursos com turma ativa naquele turno', async () => {
    routeFetch([
      makeClass('t1', 'c1', { shift: 'FULL_AM_PM' }),
      makeClass('t2', 'c2', { shift: 'FULL_PM_NT' }),
    ])

    await expect(listCourses(TOKEN, { shift: 'FULL_PM_NT' })).resolves.toEqual({
      courses: [courses[1]],
    })
  })

  it('ignora turma inativa no turno pedido (curso não entra no filtro)', async () => {
    routeFetch([makeClass('t1', 'c2', { shift: 'FULL_PM_NT', active: false })])

    await expect(listCourses(TOKEN, { shift: 'FULL_PM_NT' })).resolves.toEqual({ courses: [] })
  })

  it('mapeia 401 para HttpError unauthorized', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(listCourses(TOKEN)).rejects.toMatchObject({ kind: 'unauthorized' })
  })

  it('mapeia 500 para HttpError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))
    await expect(listCourses(TOKEN)).rejects.toMatchObject({ kind: 'server' })
  })

  it('mapeia falha de rede para HttpError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('fetch failed'))
    const error = await listCourses(TOKEN).catch((e) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ kind: 'network' })
  })
})

describe('fetchAllClasses (via filtro de turno)', () => {
  it('percorre todas as páginas de /hub/classes', async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => makeClass(`a${i}`, 'c1'))
    const secondPage = [makeClass('b0', 'c2', { shift: 'FULL_PM_NT' })]

    const fetchMock = stubFetch()
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/hub/courses')) return response(200, { courses })
      if (url.includes('/hub/classes')) {
        const page = new URL(url).searchParams.get('page')
        return page === '0' ? classesPage(firstPage, 0, 2) : classesPage(secondPage, 1, 2)
      }
      throw new Error(`URL inesperada: ${url}`)
    })

    await expect(listCourses(TOKEN, { shift: 'FULL_PM_NT' })).resolves.toEqual({
      courses: [courses[1]],
    })

    const classCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/hub/classes'))
    expect(classCalls).toHaveLength(2)
    expect(String(classCalls[0]![0])).toContain('page=0')
    expect(String(classCalls[1]![0])).toContain('page=1')
  })
})

describe('fetchClassesPage', () => {
  it('busca só a página pedida, sem percorrer as demais', async () => {
    const items = [makeClass('t1', 'c1'), makeClass('t2', 'c1')]
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(classesPage(items, 0, 5))

    await expect(fetchClassesPage(TOKEN, { page: 0, size: 20 })).resolves.toEqual({
      items,
      totalElements: items.length,
      totalPages: 5,
    })

    const classCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/hub/classes'))
    expect(classCalls).toHaveLength(1)
    expect(String(classCalls[0]![0])).toContain('page=0')
    expect(String(classCalls[0]![0])).toContain('size=20')
  })

  it('repassa includeInactive quando pedido', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(classesPage([], 0, 1))

    await fetchClassesPage(TOKEN, { includeInactive: true })

    expect(String(fetchMock.mock.calls[0]![0])).toContain('includeInactive=true')
  })
})

describe('getCourseDetail', () => {
  it('compõe o curso com suas turmas ativas e inativas', async () => {
    const fetchMock = routeFetch([
      makeClass('t1', 'c1', { active: true }),
      makeClass('t2', 'c1', { active: false }),
      makeClass('t3', 'c2'),
    ])

    const result = await getCourseDetail('c1', TOKEN)
    expect(result).toEqual({
      ...courses[0],
      classes: [makeClass('t1', 'c1', { active: true }), makeClass('t2', 'c1', { active: false })],
    })

    const detailCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/hub/courses/'))
    expect(String(detailCall![0])).toBe(`${API_GATEWAY_URL}/hub/courses/c1`)
    const classesCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/hub/classes'))
    expect(String(classesCall![0])).toContain('includeInactive=true')
  })

  it('propaga 404 sem buscar as turmas', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(404, {}))

    await expect(getCourseDetail('missing', TOKEN)).rejects.toMatchObject({ kind: 'not_found' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('createCourses', () => {
  it('cria em lote e reporta sucesso e erro por índice', async () => {
    const created = { id: 'new-1', name: 'Curso A', code: 'A', createdAt: '2026-07-14T00:00:00Z' }
    const fetchMock = stubFetch()
    fetchMock
      .mockResolvedValueOnce(response(201, created))
      .mockResolvedValueOnce(response(400, { message: 'Código já existe.' }))

    const result = await createCourses(
      [
        { code: 'A', name: 'Curso A' },
        { code: 'B', name: 'Curso B' },
      ],
      TOKEN,
    )

    expect(result.createdCount).toBe(1)
    expect(result.errorCount).toBe(1)
    expect(result.results).toEqual([
      { index: 0, status: 'created', course: created },
      { index: 1, status: 'error', error: { code: 'validation', message: 'Código já existe.' } },
    ])

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/courses`)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ code: 'A', name: 'Curso A' })
  })
})

describe('updateCourse', () => {
  it('faz PATCH em /hub/courses/{id} com o corpo enviado', async () => {
    const updated = { id: 'c1', name: 'Novo', code: 'DEV-01', updatedAt: '2026-07-14T00:00:00Z' }
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, updated))

    await expect(updateCourse('c1', { name: 'Novo' }, TOKEN)).resolves.toEqual(updated)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/courses/c1`)
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(String(init?.body))).toEqual({ name: 'Novo' })
  })

  it('mapeia 404 para HttpError not_found', async () => {
    stubFetch().mockResolvedValue(response(404, {}))
    await expect(updateCourse('missing', { name: 'X' }, TOKEN)).rejects.toMatchObject({
      kind: 'not_found',
    })
  })
})
