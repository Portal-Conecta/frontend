/**
 * Trava o contrato de nav por papel (#173): o modelo declarado em `NAV_REGISTRY`
 * cruzado com a matriz `rolePermissions` deve produzir exatamente o conjunto de
 * itens esperado para cada `TypeUser`. Também garante a invariante "a nav nunca
 * fica vazia" (decisão do "A decidir" da issue).
 */
import { describe, expect, it } from 'vitest'

import { resolvePermissions, type CurrentUser, type TypeUser } from '@portal/core/rbac'
import { activeKeyFromPathname, visibleNavFor } from '@portal/core/layout/navRegistry'

/** Monta um `CurrentUser` mínimo para um papel, como faz o BFF a partir do JWT. */
function userForRole(userType: TypeUser): CurrentUser {
  return { id: `u-${userType}`, userType, classes: [], permissions: resolvePermissions(userType) }
}

/** Nav esperada por papel — fonte de verdade do teste, espelha a tabela do registry. */
const EXPECTED: Record<TypeUser, string[]> = {
  STUDENT: ['comunicados', 'mapa-salas'],
  REPRESENTATIVE: ['comunicados', 'mapa-salas', 'checklist'],
  TEACHER: ['comunicados', 'mapa-salas', 'checklist'],
  SENAI: ['comunicados', 'mapa-salas', 'checklist', 'usuarios', 'turma', 'cursos'],
  WEG: ['comunicados', 'mapa-salas', 'checklist', 'usuarios', 'turma', 'cursos'],
  ADMIN: ['comunicados', 'mapa-salas', 'checklist', 'usuarios', 'turma', 'cursos'],
}

const ROLES = Object.keys(EXPECTED) as TypeUser[]

describe('visibleNavFor — modelo de nav por papel', () => {
  it.each(ROLES)('%s vê exatamente os itens modelados', (role) => {
    const keys = visibleNavFor(userForRole(role)).map((item) => item.key)
    expect(keys).toEqual(EXPECTED[role])
  })

  it('nenhum papel resolve nav vazia (invariante da #173)', () => {
    for (const role of ROLES) {
      expect(visibleNavFor(userForRole(role)).length).toBeGreaterThan(0)
    }
  })

  it('usuário ausente (null) vê só os itens universais', () => {
    expect(visibleNavFor(null).map((item) => item.key)).toEqual(['comunicados', 'mapa-salas'])
  })
})

describe('activeKeyFromPathname — item ativo derivado da rota (#405)', () => {
  it.each([
    ['/comunicados', 'comunicados'],
    ['/comunicados/123', 'comunicados'],
    ['/comunicados/criar', 'comunicados'],
    ['/comunicados/meus', 'comunicados'],
    ['/mapa-salas', 'mapa-salas'],
    ['/usuarios', 'usuarios'],
    ['/usuarios/abc', 'usuarios'],
  ])('%s ativa %s', (pathname, expected) => {
    expect(activeKeyFromPathname(pathname)).toBe(expected)
  })

  it.each(['/perfil', '/notifications', '/ajuda', '/'])(
    '%s não ativa item nenhum',
    (pathname) => {
      expect(activeKeyFromPathname(pathname)).toBe('')
    },
  )

  it('match é por segmento, não por prefixo cru', () => {
    expect(activeKeyFromPathname('/comunicadosx')).toBe('')
  })
})
