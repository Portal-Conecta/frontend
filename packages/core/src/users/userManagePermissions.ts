/**
 * Regra de UX (issue #508): esconde as "Ações de risco" (inativar/reativar,
 * excluir) quando o requisitante não deveria gerenciar o tipo do usuário-alvo.
 * Mesma régua de `userCreatePermissions.ts` — não há confirmação de que o
 * backend aplica essa mesma matriz para as rotas `deactivate`/`reactivate`/
 * `delete`; ver ADR-0014 e REVISION.md §5 (RBAC é UX no front, não o gate).
 *
 * Matriz "Gerenciar usuário" por tipo do requisitante:
 *
 * | Requisitante | Pode gerenciar                    |
 * |--------------|------------------------------------|
 * | ADMIN        | Qualquer tipo                      |
 * | SENAI        | STUDENT, REPRESENTATIVE, TEACHER   |
 * | WEG          | STUDENT, REPRESENTATIVE, TEACHER   |
 * | TEACHER, REPRESENTATIVE, STUDENT | Nenhum (nem chegam à tela — sem `usuarios:gerenciar`) |
 */
import type { TypeUser } from '../rbac'

const MANAGE_PERMISSIONS: Record<TypeUser, readonly TypeUser[]> = {
  ADMIN: ['STUDENT', 'REPRESENTATIVE', 'TEACHER', 'SENAI', 'WEG', 'ADMIN'],
  SENAI: ['STUDENT', 'REPRESENTATIVE', 'TEACHER'],
  WEG: ['STUDENT', 'REPRESENTATIVE', 'TEACHER'],
  TEACHER: [],
  REPRESENTATIVE: [],
  STUDENT: [],
}

/** `requester` pode inativar/reativar/excluir um usuário do tipo `target`? */
export function canManageUserType(requester: TypeUser, target: TypeUser): boolean {
  return MANAGE_PERMISSIONS[requester].includes(target)
}
