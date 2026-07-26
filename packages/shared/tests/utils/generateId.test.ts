/**
 * Testes do `generateId` (hotfix do contexto inseguro).
 *
 * O ponto do teste não é o formato do UUID e sim a independência de
 * `crypto.randomUUID`: essa API só existe em contexto seguro (HTTPS ou
 * `localhost`), e a demo em HTTP puro quebrava com
 * `TypeError: crypto.randomUUID is not a function`. Como `localhost` é isento
 * por especificação, o cenário não reproduz em `pnpm dev` — só um teste que
 * remove a API do global cobre a regressão.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateId } from '../../src/utils/generateId'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('generateId', () => {
  it('gera um UUID v4 no formato canônico', () => {
    expect(generateId()).toMatch(UUID_V4)
  })

  it('funciona em contexto inseguro, sem crypto.randomUUID (demo em HTTP puro)', () => {
    const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto)
    vi.stubGlobal('crypto', { getRandomValues })

    expect(() => generateId()).not.toThrow()
    expect(generateId()).toMatch(UUID_V4)
  })

  it('cai no fallback quando não há crypto algum', () => {
    vi.stubGlobal('crypto', undefined)

    expect(generateId()).toMatch(/^id-\d+-[a-z0-9]+$/)
  })

  it('não repete ids em chamadas seguidas', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()))

    expect(ids.size).toBe(500)
  })
})
