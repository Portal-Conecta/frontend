import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { listTurmasPage } from '@portal/core/classes/turmasService'
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

function classesPage(items: CourseClass[], page: number, totalPages: number, totalElements?: number) {
  return response(200, {
    items,
    page,
    size: 100,
    totalElements: totalElements ?? items.length,
    totalPages,
  })
}

/** Roteia o mock de fetch por URL. `classesByPage` indexa página → itens (uma só entrada = sempre a mesma página). */
function routeFetch(classesByPage: CourseClass[][], totalElements?: number) {
  const mock = stubFetch()
  mock.mockImplementation(async (input) => {
    const url = String(input)
    if (url.includes('/hub/courses')) return response(200, { courses })
    if (url.includes('/hub/classes')) {
      const page = Number(new URL(url).searchParams.get('page') ?? '0')
      const items = classesByPage[page] ?? []
      return classesPage(items, page, classesByPage.length, totalElements)
    }
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

describe('listTurmasPage', () => {
  it('sem busca/filtro: pagina de verdade contra o Hub (só a página pedida sai)', async () => {
    const page0 = [makeClass('t1', 'c1'), makeClass('t2', 'c2')]
    const fetchMock = routeFetch([page0, [makeClass('t3', 'c1')]], 3)

    const result = await listTurmasPage(TOKEN, { page: 0, size: 2 })

    expect(result.rows.map((r) => r.id)).toEqual(['t1', 't2'])
    expect(result.totalElements).toBe(3)
    expect(result.totalPages).toBe(2)
    expect(result.courseOptions).toEqual(['Desenvolvimento de Sistemas', 'Redes de Computadores'])
    expect(result.shiftOptions).toEqual(['Manhã e tarde', 'Tarde e noite'])

    // Só uma chamada a /hub/classes — não agrega todas as páginas.
    const classCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/hub/classes'))
    expect(classCalls).toHaveLength(1)
    expect(String(classCalls[0]![0])).toContain('page=0')
    expect(String(classCalls[0]![0])).toContain('size=2')
  })

  it('com busca: agrega todas as páginas do Hub, filtra e pagina o resultado em memória', async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => makeClass(`a${i}`, 'c2', { name: `X${i}` }))
    const secondPage = [makeClass('dev1', 'c1', { name: 'DEV-01 78' })]
    routeFetch([firstPage, secondPage])

    const result = await listTurmasPage(TOKEN, { search: 'dev', page: 0, size: 20 })

    expect(result.rows.map((r) => r.id)).toEqual(['dev1'])
    expect(result.totalElements).toBe(1)
    expect(result.totalPages).toBe(1)
  })

  it('com filtro de curso: agrega, filtra e pagina o resultado filtrado', async () => {
    const classes = [
      makeClass('t1', 'c1'),
      makeClass('t2', 'c2'),
      makeClass('t3', 'c1'),
    ]
    routeFetch([classes])

    const result = await listTurmasPage(TOKEN, {
      filters: { course: 'Desenvolvimento de Sistemas' },
      page: 0,
      size: 20,
    })

    expect(result.rows.map((r) => r.id)).toEqual(['t1', 't3'])
    expect(result.totalElements).toBe(2)
  })

  it('pagina o resultado filtrado corretamente na segunda página', async () => {
    const classes = Array.from({ length: 5 }, (_, i) => makeClass(`t${i}`, 'c1'))
    routeFetch([classes])

    const result = await listTurmasPage(TOKEN, {
      filters: { course: 'Desenvolvimento de Sistemas' },
      page: 1,
      size: 2,
    })

    expect(result.rows.map((r) => r.id)).toEqual(['t2', 't3'])
    expect(result.totalElements).toBe(5)
    expect(result.totalPages).toBe(3)
  })

  it('courseOptions cobre cursos sem turma na página atual — fonte é /hub/courses, não as linhas', async () => {
    routeFetch([[makeClass('t1', 'c1')]])

    const result = await listTurmasPage(TOKEN, { page: 0, size: 20 })

    expect(result.courseOptions).toContain('Redes de Computadores')
  })

  it('propaga erro de listCourses (ex.: unauthorized)', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(listTurmasPage(TOKEN)).rejects.toMatchObject({ kind: 'unauthorized' })
  })
})
