import { describe, expect, it } from 'vitest'

import { ALL_USER_ACCOUNT_STATUSES } from '../../src/users/usersLabels'
import {
  normalizeUsersFilters,
  toListUsersParams,
} from '../../src/users/toListUsersParams'

describe('toListUsersParams', () => {
  it('envia todos os status quando o filtro Status está em Todos', () => {
    expect(toListUsersParams('', {})).toEqual({
      page: 0,
      size: 50,
      status: ALL_USER_ACCOUNT_STATUSES,
    })
  })

  it('repassa busca, tipo e status específicos', () => {
    expect(
      toListUsersParams('  Ana  ', { typeUser: 'STUDENT', status: 'ACTIVE' }, 1, 20),
    ).toEqual({
      page: 1,
      size: 20,
      name: 'Ana',
      typeUser: 'STUDENT',
      status: ['ACTIVE'],
    })
  })
})

describe('normalizeUsersFilters', () => {
  it('ignora "todos" e valores inválidos', () => {
    expect(normalizeUsersFilters({ typeUser: 'todos', status: 'todos' })).toEqual({})
    expect(normalizeUsersFilters({ typeUser: 'NOPE', status: 'X' })).toEqual({})
  })

  it('aceita TypeUser e status válidos', () => {
    expect(normalizeUsersFilters({ typeUser: 'TEACHER', status: 'DISABLED' })).toEqual({
      typeUser: 'TEACHER',
      status: 'DISABLED',
    })
  })
})
