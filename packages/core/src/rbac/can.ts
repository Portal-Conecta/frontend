/**
 * Predicados de RBAC — puros, sem React nem `next/headers`, testáveis isolados.
 *
 * `can` é a checagem global (a lista `permissions` já resolvida). `hasClassRole` é
 * a checagem por turma (dimensão `ClassRole`). `filterByPermission` reusa `can` para
 * filtrar qualquer coleção declarativa (itens de nav, ações) por permissão.
 */
import type { ClassRole, CurrentUser, Permission } from './types'

/** O usuário tem a permissão global? Usuário ausente → false. */
export function can(user: CurrentUser | null | undefined, permission: Permission): boolean {
  return user?.permissions.includes(permission) ?? false
}

/** O usuário tem algum dos papéis na turma indicada? Usuário ausente → false. */
export function hasClassRole(
  user: CurrentUser | null | undefined,
  classId: string,
  roles: readonly ClassRole[],
): boolean {
  if (!user) return false
  return user.classes.some((c) => c.classId === classId && roles.includes(c.role))
}

/**
 * Filtra itens que declaram `requires?: Permission`. Item sem `requires` é visível a
 * todo autenticado. Usado pela Sidebar (nav), mas genérico para botões/ações.
 */
export function filterByPermission<T extends { requires?: Permission }>(
  items: readonly T[],
  user: CurrentUser | null | undefined,
): T[] {
  return items.filter((item) => item.requires === undefined || can(user, item.requires))
}
