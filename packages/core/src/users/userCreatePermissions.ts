/**
 * Espelha `UserPermissionValidator.CREATE_PERMISSIONS` (core-backend, único
 * lugar que hoje aplica essa regra — o front não tinha essa matriz). Divergência
 * aqui é só UX (esconder opções); o 403 real vem do backend.
 *
 * Matriz "Criar usuário" por tipo do requisitante:
 *
 * | Ação         | ADMIN                                | SENAI            | WEG      | TEACHER | REPRESENTATIVE | STUDENT |
 * |--------------|----------------------------------------|-------------------|----------|---------|----------------|---------|
 * | Criar usuário| STUDENT, TEACHER, SENAI, WEG, ADMIN | STUDENT, TEACHER | STUDENT | Não     | Não            | Não     |
 *
 * `REPRESENTATIVE` não é criável diretamente (#502) — é um papel promovido a
 * partir de um `STUDENT` já existente dentro do contexto de uma turma, não um
 * tipo de conta que nasce do zero na criação de usuário.
 */
import type { TypeUser } from '../rbac'

const CREATE_PERMISSIONS: Record<TypeUser, readonly TypeUser[]> = {
  ADMIN: ['STUDENT', 'TEACHER', 'SENAI', 'WEG', 'ADMIN'],
  SENAI: ['STUDENT', 'TEACHER'],
  WEG: ['STUDENT'],
  TEACHER: [],
  REPRESENTATIVE: [],
  STUDENT: [],
}

/** Tipos de usuário que `requester` pode criar. */
export function creatableTypeUsers(requester: TypeUser): TypeUser[] {
  return [...CREATE_PERMISSIONS[requester]]
}
