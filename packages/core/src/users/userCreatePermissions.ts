/**
 * Espelha `UserPermissionValidator.CREATE_PERMISSIONS` (core-backend, único
 * lugar que hoje aplica essa regra — o front não tinha essa matriz). Divergência
 * aqui é só UX (esconder opções); o 403 real vem do backend.
 *
 * Matriz "Criar usuário" por tipo do requisitante:
 *
 * | Ação         | ADMIN       | SENAI            | WEG      | TEACHER | REPRESENTATIVE | STUDENT |
 * |--------------|-------------|-------------------|----------|---------|----------------|---------|
 * | Criar usuário| Qualquer tipo | STUDENT, TEACHER | STUDENT | Não     | Não            | Não     |
 */
import type { TypeUser } from '../rbac'

const CREATE_PERMISSIONS: Record<TypeUser, readonly TypeUser[]> = {
  ADMIN: ['STUDENT', 'REPRESENTATIVE', 'TEACHER', 'SENAI', 'WEG', 'ADMIN'],
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
