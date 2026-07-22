/**
 * Testes do service server de opções de sala/turma (`services/server/hubOptionsService`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { listMyTurmaFilterOptions } from '../../src/services/server/hubOptionsService'
import type { MyListCourseResponse } from '../../../core/src/profile/types'

const API_GATEWAY_URL = 'https://gateway.test'

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

const myCourses: MyListCourseResponse = {
  courses: [
    {
      id: 'course-1',
      name: 'Desenvolvimento de Sistemas',
      code: 'DS',
      classes: [
        { id: 'turma-1', name: 'DS-101', number: 101, shift: 'FULL_AM_PM', classRole: 'TEACHER' },
        { id: 'turma-2', name: 'DS-102', number: 102, shift: 'FULL_PM_NT', classRole: 'STUDENT' },
      ],
    },
    {
      id: 'course-2',
      name: 'Mecatrônica',
      code: 'MEC',
      classes: [{ id: 'turma-3', name: 'MEC-201', number: 201, shift: 'FULL_PM_NT', classRole: 'TEACHER' }],
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

describe('listMyTurmaFilterOptions', () => {
  it('busca GET /hub/me/courses com o token explícito e mapeia só as turmas onde classRole é TEACHER', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, myCourses))

    await expect(listMyTurmaFilterOptions('jwt-token')).resolves.toEqual([
      { id: 'turma-1', code: 'DS-101', label: 'Manhã e tarde' },
      { id: 'turma-3', code: 'MEC-201', label: 'Tarde e noite' },
    ])

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/hub/me/courses`)
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token')
  })

  it('retorna lista vazia quando o usuário não tem nenhuma turma como TEACHER', async () => {
    stubFetch().mockResolvedValue(
      response(200, { courses: [{ id: 'c1', name: 'X', code: 'X', classes: [] }] } satisfies MyListCourseResponse),
    )

    await expect(listMyTurmaFilterOptions('jwt-token')).resolves.toEqual([])
  })
})
