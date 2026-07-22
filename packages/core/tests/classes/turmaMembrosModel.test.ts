import { describe, expect, it } from 'vitest'

import {
  applySavedDiff,
  buildSearchResults,
  computeMembersDiff,
  draftFreedMembers,
  excludeLinkedUsers,
  filterMembersByTab,
  isMembersDirty,
  resolveAddClassRole,
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

describe('draftFreedMembers', () => {
  it('filtra removidos do rascunho pela aba ativa', () => {
    expect(draftFreedMembers([aluno, representante, professor], 'STUDENT', '')).toEqual([
      aluno,
      representante,
    ])
    expect(draftFreedMembers([aluno, representante, professor], 'TEACHER', '')).toEqual([professor])
  })

  it('filtra por busca de nome (case-insensitive, substring)', () => {
    expect(draftFreedMembers([aluno, representante], 'STUDENT', 'an')).toEqual([aluno])
    expect(draftFreedMembers([aluno, representante], 'STUDENT', 'ZZZ')).toEqual([])
  })

  it('sem removidos pendentes, retorna vazio', () => {
    expect(draftFreedMembers([], 'STUDENT', '')).toEqual([])
  })
})

describe('buildSearchResults', () => {
  it('não duplica professor removido do rascunho quando a busca ainda o retorna', () => {
    // O backend ignora `semTurmaAtiva` para professores — sem a exclusão extra
    // de `freed`, `professor` apareceria duas vezes (uma via freed, outra via
    // excludeLinkedUsers, já que `linkedMembers` não o contém mais).
    const users: DirectoryUser[] = [
      {
        id: professor.id,
        name: professor.name,
        email: 'caio@x.com',
        typeUser: 'TEACHER',
        active: true,
        createdAt: '2026-01-01',
      },
    ]
    const linkedMembers: ClassMember[] = []
    const freed = [professor]

    const results = buildSearchResults(users, linkedMembers, freed)

    expect(results).toEqual([professor])
  })

  it('mantém o restante da busca real após os itens removidos do rascunho', () => {
    const outro: DirectoryUser = {
      id: 'u5',
      name: 'Duda',
      email: 'duda@x.com',
      typeUser: 'STUDENT',
      active: true,
      createdAt: '2026-01-01',
    }
    const users: DirectoryUser[] = [outro]
    const linkedMembers: ClassMember[] = []
    const freed = [aluno]

    expect(buildSearchResults(users, linkedMembers, freed)).toEqual([aluno, outro])
  })

  it('sem removidos pendentes, comporta-se como excludeLinkedUsers', () => {
    const users: DirectoryUser[] = [
      { id: 'u1', name: 'Ana', email: 'ana@x.com', typeUser: 'STUDENT', active: true, createdAt: '2026-01-01' },
      { id: 'u4', name: 'Duda', email: 'duda@x.com', typeUser: 'STUDENT', active: true, createdAt: '2026-01-01' },
    ]

    expect(buildSearchResults(users, [aluno], [])).toEqual([users[1]])
  })
})

describe('resolveAddClassRole', () => {
  it('preserva REPRESENTATIVE ao readicionar membro do rascunho na aba Alunos', () => {
    expect(resolveAddClassRole(representante, 'STUDENT')).toBe('REPRESENTATIVE')
  })

  it('preserva TEACHER / STUDENT do ClassMember mesmo se a aba divergir', () => {
    expect(resolveAddClassRole(professor, 'STUDENT')).toBe('TEACHER')
    expect(resolveAddClassRole(aluno, 'TEACHER')).toBe('STUDENT')
  })

  it('usa a aba ativa para resultado do diretório (sem role)', () => {
    const fromDirectory: Pick<DirectoryUser, 'id' | 'name'> = { id: 'u9', name: 'Eva' }
    expect(resolveAddClassRole(fromDirectory, 'STUDENT')).toBe('STUDENT')
    expect(resolveAddClassRole(fromDirectory, 'TEACHER')).toBe('TEACHER')
  })
})

describe('applySavedDiff', () => {
  it('aplica só adds/removes confirmados pelo servidor, sobrando o resto pendente', () => {
    const original = [aluno, professor]

    const next = applySavedDiff(original, [representante], ['u3'])

    expect(next).toEqual([aluno, representante])
  })
})
