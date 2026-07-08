/**
 * Testes dos predicados de RBAC (`can`, `hasClassRole`, `filterByPermission`).
 * Usuário ausente sempre nega (fail-safe: a favor de esconder).
 */
import { describe, expect, it } from 'vitest'

import { can, filterByPermission, hasClassRole, type CurrentUser } from '@portal/core/rbac'

const weg: CurrentUser = {
  id: 'u1',
  userType: 'WEG',
  classes: [
    { classId: 'c1', role: 'TEACHER' },
    { classId: 'c2', role: 'STUDENT' },
  ],
  permissions: ['comunicados:ver', 'mapa:ver', 'salas:gerenciar'],
}

describe('can', () => {
  it('true quando a permissão está na lista do usuário', () => {
    expect(can(weg, 'salas:gerenciar')).toBe(true)
  })

  it('false quando a permissão não está na lista', () => {
    expect(can(weg, 'matriculas:gerenciar')).toBe(false)
  })

  it('false para usuário nulo/ausente', () => {
    expect(can(null, 'comunicados:ver')).toBe(false)
    expect(can(undefined, 'comunicados:ver')).toBe(false)
  })
})

describe('hasClassRole', () => {
  it('true quando o usuário tem o papel na turma', () => {
    expect(hasClassRole(weg, 'c1', ['TEACHER'])).toBe(true)
  })

  it('false quando o papel não bate naquela turma', () => {
    expect(hasClassRole(weg, 'c2', ['TEACHER'])).toBe(false)
  })

  it('false para turma inexistente ou usuário nulo', () => {
    expect(hasClassRole(weg, 'c9', ['TEACHER', 'STUDENT'])).toBe(false)
    expect(hasClassRole(null, 'c1', ['TEACHER'])).toBe(false)
  })
})

describe('filterByPermission', () => {
  const items = [
    { key: 'comunicados' },
    { key: 'checklist', requires: 'checklist:ver' as const },
    { key: 'config', requires: 'usuarios:gerenciar' as const },
  ]

  it('mantém itens sem requires e remove os sem permissão', () => {
    const result = filterByPermission(items, weg)
    expect(result.map((i) => i.key)).toEqual(['comunicados'])
  })

  it('usuário nulo vê só os itens sem requires', () => {
    expect(filterByPermission(items, null).map((i) => i.key)).toEqual(['comunicados'])
  })

  it('admin com a permissão vê o item restrito', () => {
    const admin: CurrentUser = { ...weg, permissions: ['usuarios:gerenciar'] }
    expect(filterByPermission(items, admin).map((i) => i.key)).toEqual(['comunicados', 'config'])
  })
})
