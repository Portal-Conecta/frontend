/**
 * Lógica pura de agrupamento dos membros de uma turma — sem React, sem I/O,
 * testável isolada (mesmo padrão do `turmaRows`).
 *
 * `GET /classes/{classId}/members` devolve todos os membros de uma vez, cada um
 * com o seu papel. O ponto não-óbvio: `REPRESENTATIVE` é **irmão** de `STUDENT`
 * no enum, não um flag à parte — representante *é* aluno da turma (mesmo
 * critério do `STUDENT_CLASS_ROLES` no `classMembersService`). Por isso a aba
 * "Alunos" é `role !== 'TEACHER'` e não `role === 'STUDENT'`: filtrar por
 * `STUDENT` sumiria com os representantes da lista.
 */
import type { ClassMember } from './types'

export interface ClassMemberGroups {
  /** Aba "Alunos" — inclui os representantes. */
  students: ClassMember[]
  /** Aba "Professores". */
  teachers: ClassMember[]
  /** Painel lateral — subconjunto de `students`. */
  representatives: ClassMember[]
}

/** Ordem alfabética pt-BR: a ordem do backend é de inserção, sem valor para quem lê. */
function byName(a: ClassMember, b: ClassMember): number {
  return a.name.localeCompare(b.name, 'pt-BR')
}

export function groupClassMembers(members: readonly ClassMember[]): ClassMemberGroups {
  const students = members.filter((member) => member.role !== 'TEACHER').sort(byName)

  return {
    students,
    teachers: members.filter((member) => member.role === 'TEACHER').sort(byName),
    representatives: students.filter((member) => member.role === 'REPRESENTATIVE'),
  }
}
