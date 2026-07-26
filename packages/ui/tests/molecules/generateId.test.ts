/**
 * Testes do `generateId` do `FileUpload` (hotfix do contexto inseguro).
 *
 * `addFiles` chamava `crypto.randomUUID()`, que só existe em contexto seguro
 * (HTTPS ou `localhost`). Servida por HTTP puro, a demo quebrava dentro do
 * `.map()` antes do `onChange` — preview sumia e o comunicado era publicado
 * sem imagem. `addFiles` não é exportado (é interno ao componente, e ainda não
 * há jsdom/Testing Library no monorepo), então a cobertura fica na função pura
 * que gera o id, que é onde o bug morava.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateId } from '../../src/molecules/FileUpload/generateId'

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

  it('não repete ids — itens distintos do FileUpload não colidem em key', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()))

    expect(ids.size).toBe(500)
  })
})
