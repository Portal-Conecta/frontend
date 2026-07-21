/**
 * Espelha `UserPermissionValidator.CREATE_PERMISSIONS` (core-backend, único
 * lugar que hoje aplica essa regra — o front não tinha essa matriz). ADMIN cria
 * qualquer tipo; SENAI só Estudante/Professor; WEG só Estudante. Divergência
 * aqui é só UX (esconder opções); o 403 real vem do backend.
 */
import { TYPE_USER_VALUES, type TypeUser } from '../rbac'

const CREATE_PERMISSIONS: Partial<Record<TypeUser, readonly TypeUser[]>> = {
  SENAI: ['STUDENT', 'TEACHER'],
  WEG: ['STUDENT'],
}

/** Tipos de usuário que `requester` pode criar. */
export function creatableTypeUsers(requester: TypeUser): TypeUser[] {
  if (requester === 'ADMIN') {
    return [...TYPE_USER_VALUES]
  }
  return [...(CREATE_PERMISSIONS[requester] ?? [])]
}
