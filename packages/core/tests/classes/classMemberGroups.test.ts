import { describe, expect, it } from 'vitest'

import { groupClassMembers } from '@portal/core/classes/classMemberGroups'
import type { ClassMember } from '@portal/core/classes/types'

const member = (id: string, name: string, role: ClassMember['role']): ClassMember => ({
  id,
  name,
  role,
})

describe('groupClassMembers', () => {
  it('separa alunos de professores', () => {
    const groups = groupClassMembers([
      member('1', 'Ana', 'STUDENT'),
      member('2', 'Bruno', 'TEACHER'),
    ])

    expect(groups.students.map((m) => m.name)).toEqual(['Ana'])
    expect(groups.teachers.map((m) => m.name)).toEqual(['Bruno'])
  })

  it('mantém o representante na aba de alunos (REPRESENTATIVE não exclui de STUDENT)', () => {
    const groups = groupClassMembers([
      member('1', 'Ana', 'STUDENT'),
      member('2', 'Carla', 'REPRESENTATIVE'),
    ])

    expect(groups.students.map((m) => m.name)).toEqual(['Ana', 'Carla'])
    expect(groups.representatives.map((m) => m.name)).toEqual(['Carla'])
  })

  it('não conta professor como representante nem como aluno', () => {
    const groups = groupClassMembers([member('1', 'Bruno', 'TEACHER')])

    expect(groups.students).toEqual([])
    expect(groups.representatives).toEqual([])
  })

  it('ordena cada grupo por nome (pt-BR, acento não vai pro fim)', () => {
    const groups = groupClassMembers([
      member('1', 'Zeca', 'STUDENT'),
      member('2', 'Álvaro', 'STUDENT'),
      member('3', 'Bruno', 'STUDENT'),
    ])

    expect(groups.students.map((m) => m.name)).toEqual(['Álvaro', 'Bruno', 'Zeca'])
  })

  it('devolve grupos vazios para turma sem membros', () => {
    expect(groupClassMembers([])).toEqual({ students: [], teachers: [], representatives: [] })
  })
})
