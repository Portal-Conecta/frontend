import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const API_GATEWAY_URL = 'https://gateway.test'
const TOKEN = 'jwt'

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('getUserActiveClassId', () => {
  beforeEach(() => {
    process.env.API_GATEWAY_URL = API_GATEWAY_URL
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.API_GATEWAY_URL
  })

  it('retorna o UUID da turma ativa', async () => {
    const { getUserActiveClassId } = await import('../../src/users/loadUserClassCard')
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)
    mock.mockResolvedValue(response(200, '550e8400-e29b-41d4-a716-446655440000'))

    await expect(getUserActiveClassId('user-1', TOKEN)).resolves.toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    )

    const [url] = mock.mock.calls[0]!
    expect(new URL(url as string).pathname).toBe('/hub/users/user-1/class')
  })

  it('404 vira null (sem turma)', async () => {
    const { getUserActiveClassId } = await import('../../src/users/loadUserClassCard')
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)
    mock.mockResolvedValue(response(404, { code: 'not_found' }))

    await expect(getUserActiveClassId('user-1', TOKEN)).resolves.toBeNull()
  })
})

describe('loadUserClassCard', () => {
  beforeEach(() => {
    process.env.API_GATEWAY_URL = API_GATEWAY_URL
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.API_GATEWAY_URL
  })

  it('compõe class + turma + curso em ClassCardItem', async () => {
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)

    mock
      .mockResolvedValueOnce(response(200, 'class-1'))
      .mockResolvedValueOnce(
        response(200, {
          id: 'class-1',
          shift: 'FULL_AM_PM',
          number: 78,
          name: 'DEV-01 78',
          active: true,
          courseId: 'course-1',
          createdAt: '2026-07-14T00:00:00Z',
        }),
      )
      .mockResolvedValueOnce(
        response(200, {
          id: 'course-1',
          name: 'Desenvolvimento de Sistemas',
          code: 'DEV-01',
        }),
      )

    const { loadUserClassCard } = await import('../../src/users/loadUserClassCard')
    await expect(loadUserClassCard('user-1', TOKEN)).resolves.toEqual({
      tag: 'DEV-01 - 78',
      title: 'Desenvolvimento de Sistemas',
      meta: 'Manhã e tarde',
    })

    expect(mock).toHaveBeenCalledTimes(3)
    expect(new URL(mock.mock.calls[0]![0] as string).pathname).toBe('/hub/users/user-1/class')
    expect(new URL(mock.mock.calls[1]![0] as string).pathname).toBe('/hub/classes/class-1')
    expect(new URL(mock.mock.calls[2]![0] as string).pathname).toBe('/hub/courses/course-1')
  })

  it('retorna null quando o usuário não tem turma ativa', async () => {
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)
    mock.mockResolvedValue(response(404, { code: 'not_found' }))

    const { loadUserClassCard } = await import('../../src/users/loadUserClassCard')
    await expect(loadUserClassCard('user-1', TOKEN)).resolves.toBeNull()
    expect(mock).toHaveBeenCalledTimes(1)
  })
})
