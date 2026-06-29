/**
 * Testes do safeNext — sanitização do `next` de redirect pós-refresh.
 *
 * Foco em open redirect: a defesa não pode olhar só a string crua, porque o
 * WHATWG URL parser remove tab/LF/CR e normaliza `\` antes de resolver. Os casos
 * de ataque abaixo (tab, backslash, `//`, host absoluto) devem todos cair no
 * fallback; só caminhos relativos same-origin passam.
 */
import { describe, expect, it } from 'vitest'

import { safeNext } from '@portal/core/auth/safeNext'

const BASE = 'https://portal.test/api/auth/refresh'
const FALLBACK = '/comunicados'

describe('safeNext', () => {
  it('mantém um caminho relativo same-origin', () => {
    expect(safeNext('/mapa-salas', BASE)).toBe('/mapa-salas')
  })

  it('preserva a query string do caminho relativo', () => {
    expect(safeNext('/comunicados?tab=novos', BASE)).toBe('/comunicados?tab=novos')
  })

  it('cai no fallback quando next é null', () => {
    expect(safeNext(null, BASE)).toBe(FALLBACK)
  })

  it('cai no fallback quando next é string vazia', () => {
    expect(safeNext('', BASE)).toBe(FALLBACK)
  })

  // Vetores de open redirect — todos devem ser rejeitados.
  it.each([
    ['//evil.com', 'protocol-relative'],
    ['/\t/evil.com', 'tab removido pelo parser → //evil.com'],
    ['/\n/evil.com', 'LF removido pelo parser'],
    ['/\\evil.com', 'backslash normalizado para /'],
    ['https://evil.com/phish', 'host absoluto externo'],
    ['http://evil.com', 'host absoluto externo sem path'],
  ])('rejeita %j (%s) caindo no fallback', (raw) => {
    expect(safeNext(raw, BASE)).toBe(FALLBACK)
  })

  it('rejeita URL malformada', () => {
    expect(safeNext('http://', BASE)).toBe(FALLBACK)
  })
})
