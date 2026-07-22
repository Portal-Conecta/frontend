import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserActiveClassId, loadUserClassCard } from '@portal/core/users/loadUserClassCard'

const API_GATEWAY_URL = 'https://gateway.test'
const TOKEN = 'jwt'

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

const membership = {
  id: 'class-1',
  name: 'DEV-01 78',
  shift: 'FULL_AM_PM',
  number: 78,
  active: true,
  courseId: 'course-1',
  createdAt: '2026-07-14T00:00:00Z',
  classRole: 'STUDENT',
}

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('getUserActiveClassId', () => {
  it('retorna o id do primeiro vínculo do array', async () => {
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)
    mock.mockResolvedValue(response(200, [membership]))

    await expect(getUserActiveClassId('user-1', TOKEN)).resolves.toBe('class-1')

    const [url] = mock.mock.calls[0]!
    expect(new URL(url as string).pathname).toBe('/hub/users/user-1/class')
  })

  it('array vazio (sem vínculo ativo) vira null — o hub não usa 404 pra esse caso', async () => {
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)
    mock.mockResolvedValue(response(200, []))

    await expect(getUserActiveClassId('user-1', TOKEN)).resolves.toBeNull()
  })
})

describe('loadUserClassCard', () => {
  it('compõe o vínculo (já traz turno/número/courseId) + curso em ClassCardItem', async () => {
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)

    mock
      .mockResolvedValueOnce(response(200, [membership]))
      .mockResolvedValueOnce(
        response(200, { id: 'course-1', name: 'Desenvolvimento de Sistemas', code: 'DEV-01' }),
      )

    await expect(loadUserClassCard('user-1', TOKEN)).resolves.toEqual({
      tag: 'DEV-01 - 78',
      title: 'Desenvolvimento de Sistemas',
      meta: 'Manhã e tarde',
    })

    expect(mock).toHaveBeenCalledTimes(2)
    expect(new URL(mock.mock.calls[0]![0] as string).pathname).toBe('/hub/users/user-1/class')
    expect(new URL(mock.mock.calls[1]![0] as string).pathname).toBe('/hub/courses/course-1')
  })

  it('retorna null quando o array de vínculos vem vazio', async () => {
    const mock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', mock)
    mock.mockResolvedValue(response(200, []))

    await expect(loadUserClassCard('user-1', TOKEN)).resolves.toBeNull()
    expect(mock).toHaveBeenCalledTimes(1)
  })
})
