/**
 * Testes de setSession — foco na resolução da flag `secure` dos cookies.
 *
 * `setSession` usa `next/headers` (server-only), então mockamos `cookies()` por
 * um dublê cujo `.set` é um spy: assim inspecionamos as opções passadas a cada
 * cookie sem tocar em request/response reais. `vi.hoisted` garante que o spy
 * exista antes do `vi.mock` (hoisted) referenciá-lo.
 *
 * A env é controlada por `vi.stubEnv` e limpa no `afterEach` — testes não podem
 * vazar `NODE_ENV`/`COOKIE_SECURE` entre si.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { setSpy } = vi.hoisted(() => ({ setSpy: vi.fn() }))

vi.mock('next/headers', () => ({
  cookies: async () => ({ set: setSpy }),
}))

import { setSession } from '@portal/core/auth/session'

const payload = { accessToken: 'a', refreshToken: 'r', expiresIn: 900 }

/** Valor de `secure` aplicado a cada cookie escrito por setSession. */
function secureFlags(): boolean[] {
  return setSpy.mock.calls.map((call) => (call[2] as { secure: boolean }).secure)
}

beforeEach(() => {
  setSpy.mockClear()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('setSession — flag secure dos cookies', () => {
  it('sem COOKIE_SECURE, mantém secure em produção (comportamento antigo)', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    await setSession(payload)

    expect(setSpy).toHaveBeenCalledTimes(2)
    expect(secureFlags()).toEqual([true, true])
  })

  it('sem COOKIE_SECURE, não marca secure fora de produção', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    await setSession(payload)

    expect(secureFlags()).toEqual([false, false])
  })

  it('COOKIE_SECURE=false desliga secure mesmo em produção (EC2 sob HTTP puro)', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('COOKIE_SECURE', 'false')

    await setSession(payload)

    expect(setSpy).toHaveBeenCalledTimes(2)
    expect(secureFlags()).toEqual([false, false])
  })

  it('COOKIE_SECURE=true liga secure mesmo fora de produção', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('COOKIE_SECURE', 'true')

    await setSession(payload)

    expect(secureFlags()).toEqual([true, true])
  })
})
