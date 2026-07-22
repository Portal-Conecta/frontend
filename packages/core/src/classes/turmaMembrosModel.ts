import type { ClassRole } from '../rbac'
import type { ClassMember, DirectoryUser } from './types'

/** Papéis de "aluno da turma" (mesmo agrupamento de `STUDENT_CLASS_ROLES` em `classMembersService.ts`). */
const STUDENT_CLASS_ROLES: ReadonlySet<ClassRole> = new Set(['STUDENT', 'REPRESENTATIVE'])

/** Filtra membros pela aba ativa — "Alunos" cobre STUDENT+REPRESENTATIVE, "Professores" só TEACHER. */
export function filterMembersByTab(
  members: readonly ClassMember[],
  tab: 'STUDENT' | 'TEACHER',
): ClassMember[] {
  return members.filter((member) =>
    tab === 'STUDENT' ? STUDENT_CLASS_ROLES.has(member.role) : member.role === 'TEACHER',
  )
}

export interface MembersDiff {
  toAdd: ClassMember[]
  toRemove: ClassMember[]
}

/** Diff entre a baseline salva e a cópia de trabalho — quem entra e quem sai. */
export function computeMembersDiff(
  original: readonly ClassMember[],
  current: readonly ClassMember[],
): MembersDiff {
  const originalIds = new Set(original.map((member) => member.id))
  const currentIds = new Set(current.map((member) => member.id))

  return {
    toAdd: current.filter((member) => !originalIds.has(member.id)),
    toRemove: original.filter((member) => !currentIds.has(member.id)),
  }
}

/** Há alterações pendentes (adds ou removes) em relação à baseline. */
export function isMembersDirty(original: readonly ClassMember[], current: readonly ClassMember[]): boolean {
  const { toAdd, toRemove } = computeMembersDiff(original, current)
  return toAdd.length > 0 || toRemove.length > 0
}

/** Tira da busca quem já está vinculado (ou pendente de vínculo) — evita oferecer duplicata. */
export function excludeLinkedUsers(
  users: readonly DirectoryUser[],
  linked: readonly ClassMember[],
): DirectoryUser[] {
  const linkedIds = new Set(linked.map((member) => member.id))
  return users.filter((user) => !linkedIds.has(user.id))
}

/**
 * Recalcula a baseline após um save parcialmente bem-sucedido: aplica só os
 * adds/removes que o servidor confirmou, sobrando as falhas como diff pendente
 * pro próximo "Salvar Edições".
 */
export function applySavedDiff(
  original: readonly ClassMember[],
  succeededAdds: readonly ClassMember[],
  succeededRemoveIds: readonly string[],
): ClassMember[] {
  const removedSet = new Set(succeededRemoveIds)
  const kept = original.filter((member) => !removedSet.has(member.id))
  return [...kept, ...succeededAdds]
}
