import { describe, expect, it } from 'vitest'

import {
  applySavedDiff,
  computeMembersDiff,
  excludeLinkedUsers,
  filterMembersByTab,
  isMembersDirty,
} from '@portal/core/classes/turmaMembrosModel'
import type { ClassMember, DirectoryUser } from '@portal/core/classes/types'

const aluno: ClassMember = { id: 'u1', name: 'Ana', role: 'STUDENT' }
const representante: ClassMember = { id: 'u2', name: 'Bia', role: 'REPRESENTATIVE' }
const professor: ClassMember = { id: 'u3', name: 'Caio', role: 'TEACHER' }

describe('filterMembersByTab', () => {
  it('aba Alunos inclui STUDENT e REPRESENTATIVE', () => {
    expect(filterMembersByTab([aluno, representante, professor], 'STUDENT')).toEqual([aluno, representante])
  })

  it('aba Professores inclui só TEACHER', () => {
    expect(filterMembersByTab([aluno, representante, professor], 'TEACHER')).toEqual([professor])
  })
})

describe('computeMembersDiff', () => {
  it('detecta adds e removes em relação à baseline', () => {
    const original = [aluno, professor]
    const current = [aluno, representante]

    expect(computeMembersDiff(original, current)).toEqual({
      toAdd: [representante],
      toRemove: [professor],
    })
  })

  it('sem alteração retorna diff vazio', () => {
    const original = [aluno, professor]
    expect(computeMembersDiff(original, [...original])).toEqual({ toAdd: [], toRemove: [] })
  })
})

describe('isMembersDirty', () => {
  it('true quando há adds ou removes', () => {
    expect(isMembersDirty([aluno], [aluno, professor])).toBe(true)
    expect(isMembersDirty([aluno, professor], [aluno])).toBe(true)
  })

  it('false quando a lista atual é igual à baseline', () => {
    expect(isMembersDirty([aluno, professor], [professor, aluno])).toBe(false)
  })
})

describe('excludeLinkedUsers', () => {
  it('tira da busca quem já está vinculado', () => {
    const users: DirectoryUser[] = [
      { id: 'u1', name: 'Ana', email: 'ana@x.com', typeUser: 'STUDENT', active: true, createdAt: '2026-01-01' },
      { id: 'u4', name: 'Duda', email: 'duda@x.com', typeUser: 'STUDENT', active: true, createdAt: '2026-01-01' },
    ]

    expect(excludeLinkedUsers(users, [aluno])).toEqual([users[1]])
  })
})

describe('applySavedDiff', () => {
  it('aplica só adds/removes confirmados pelo servidor, sobrando o resto pendente', () => {
    const original = [aluno, professor]

    const next = applySavedDiff(original, [representante], ['u3'])

    expect(next).toEqual([aluno, representante])
  })
})
