/**
 * Testes do authService — exemplo-referência de teste de lógica com Vitest.
 *
 * Leia isto se é seu primeiro teste no projeto:
 * - `login`/`refresh` são funções puras: só falam com o back via `fetch` global.
 *   Não há React nem `next/headers` aqui, então rodam em ambiente `node` puro.
 * - Não chamamos o back de verdade: trocamos o `fetch` global por um dublê
 *   (`vi.stubGlobal('fetch', ...)`) que devolve a resposta que o teste quiser.
 *   Assim controlamos status HTTP, corpo e até erro de rede sem servidor.
 * - `baseUrl()` lê `process.env.API_URL`, então setamos a env antes de cada teste
 *   e limpamos depois — testes não podem vazar estado entre si.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthError, login, refresh } from '@portal/core/auth/authService'

const API_URL = 'https://api.test'

/** Monta um dublê de Response com só o que o authService consome. */
function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

/** Dublê de Response cujo `.json()` falha (corpo ilegível). */
function brokenJsonResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token')
    },
  } as unknown as Response
}

/** Substitui o `fetch` global por um mock e devolve a referência tipada. */
function stubFetch() {
  const mock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', mock)
  return mock
}

const session = { accessToken: 'a', refreshToken: 'r', expiresIn: 900 }

beforeEach(() => {
  process.env.API_URL = API_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_URL
  delete process.env.NEXT_PUBLIC_API_URL
})

describe('login', () => {
  it('retorna a sessão e envia email/password para /auth/login', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, session))

    await expect(login('user@weg.net', 'segredo')).resolves.toEqual(session)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_URL}/auth/login`)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ email: 'user@weg.net', password: 'segredo' })
  })

  it('mapeia 401 para AuthError invalid_credentials', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(login('user@weg.net', 'errada')).rejects.toMatchObject({ kind: 'invalid_credentials' })
  })

  it.each([400, 422])('mapeia %i para AuthError validation', async (status) => {
    stubFetch().mockResolvedValue(response(status, {}))
    await expect(login('invalido', 'x')).rejects.toMatchObject({ kind: 'validation' })
  })

  it('mapeia 500 (status inesperado) para AuthError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))
    await expect(login('user@weg.net', 'x')).rejects.toMatchObject({ kind: 'server' })
  })

  it('mapeia falha de rede (fetch rejeita) para AuthError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(login('user@weg.net', 'x')).rejects.toMatchObject({ kind: 'network' })
  })

  it('mapeia resposta 200 com JSON inválido para AuthError server', async () => {
    stubFetch().mockResolvedValue(brokenJsonResponse(200))
    await expect(login('user@weg.net', 'x')).rejects.toMatchObject({ kind: 'server' })
  })

  it('lança AuthError server quando API_URL não está configurada', async () => {
    delete process.env.API_URL
    stubFetch() // não deve nem ser chamado
    await expect(login('user@weg.net', 'x')).rejects.toMatchObject({ kind: 'server' })
  })

  it('o erro lançado é uma instância de AuthError', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(login('user@weg.net', 'x')).rejects.toBeInstanceOf(AuthError)
  })
})

describe('refresh', () => {
  it('retorna a sessão e envia refreshToken para /auth/refresh', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(200, session))

    await expect(refresh('token-antigo')).resolves.toEqual(session)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_URL}/auth/refresh`)
    expect(JSON.parse(init?.body as string)).toEqual({ refreshToken: 'token-antigo' })
  })

  it('mapeia 401 para AuthError invalid_credentials', async () => {
    stubFetch().mockResolvedValue(response(401, {}))
    await expect(refresh('expirado')).rejects.toMatchObject({ kind: 'invalid_credentials' })
  })

  it('mapeia status inesperado para AuthError server', async () => {
    stubFetch().mockResolvedValue(response(500, {}))
    await expect(refresh('token')).rejects.toMatchObject({ kind: 'server' })
  })

  it('mapeia falha de rede para AuthError network', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(refresh('token')).rejects.toMatchObject({ kind: 'network' })
  })
})
