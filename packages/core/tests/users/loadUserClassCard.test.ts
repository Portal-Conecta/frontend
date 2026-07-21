import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { userProfileStatusLabel } from '../../src/users/userProfileStatusLabel'

describe('userProfileStatusLabel', () => {
  it('mapeia active para Ativo/Inativo', () => {
    expect(userProfileStatusLabel(true)).toBe('Ativo')
    expect(userProfileStatusLabel(false)).toBe('Inativo')
  })
})

describe('getUserActiveClassId', () => {
  const API_GATEWAY_URL = 'https://gateway.test'
  const TOKEN = 'jwt'

  function response(status: number, body: unknown): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as unknown as Response
  }

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
