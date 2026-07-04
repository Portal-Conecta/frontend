/**
 * Testes do montador `parseUserFromToken` — decodifica o payload do JWT e resolve as
 * permissões. Não verifica assinatura (RBAC do front é UX; o back revalida). Qualquer
 * claim inválido → null (fail-safe).
 */
import { describe, expect, it } from 'vitest'

import { parseUserFromToken } from '@portal/core/rbac'

/** Monta um JWT `header.payload.signature` com o payload pedido (base64url). */
function makeToken(claims: object): string {
  const seg = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${seg({ alg: 'none' })}.${seg(claims)}.assinatura`
}

describe('parseUserFromToken', () => {
  it('monta o CurrentUser a partir dos claims e resolve as permissões', () => {
    const token = makeToken({
      sub: 'u-123',
      userType: 'WEG',
      classes: [{ classId: 'c1', role: 'TEACHER' }],
    })
    const user = parseUserFromToken(token)
    expect(user).toEqual({
      id: 'u-123',
      userType: 'WEG',
      classes: [{ classId: 'c1', role: 'TEACHER' }],
      permissions: expect.arrayContaining(['comunicados:ver', 'salas:gerenciar']),
    })
    expect(user?.permissions).not.toContain('matriculas:gerenciar')
  })

  it('ignora entradas de classes malformadas e aceita ausência de classes', () => {
    const token = makeToken({
      sub: 'u1',
      userType: 'STUDENT',
      classes: [{ classId: 'ok', role: 'STUDENT' }, { classId: 42 }, { role: 'X' }, 'lixo'],
    })
    expect(parseUserFromToken(token)?.classes).toEqual([{ classId: 'ok', role: 'STUDENT' }])
    const semClasses = makeToken({ sub: 'u1', userType: 'STUDENT' })
    expect(parseUserFromToken(semClasses)?.classes).toEqual([])
  })

  it.each([
    ['token nulo', null],
    ['token vazio', ''],
    ['sem payload', 'abc'],
    ['payload não-base64/JSON', 'h.@@@.s'],
  ])('retorna null para %s', (_caso, token) => {
    expect(parseUserFromToken(token)).toBeNull()
  })

  it('retorna null quando userType é inválido ou ausente, ou sub falta', () => {
    expect(parseUserFromToken(makeToken({ sub: 'u1', userType: 'GERENTE' }))).toBeNull()
    expect(parseUserFromToken(makeToken({ sub: 'u1' }))).toBeNull()
    expect(parseUserFromToken(makeToken({ userType: 'ADMIN' }))).toBeNull()
  })
})
