import type { ListUsersParams } from '../classes/userDirectoryService'
import type { TypeUser } from '../rbac'
import type { UserAccountStatus } from '../classes/types'

import {
  ALL_USER_ACCOUNT_STATUSES,
  isStatusFilter,
  isTypeUserFilter,
} from './usersLabels'

/** Filtros aplicados da UI de listagem (#440). */
export interface UsersListFilters {
  typeUser?: TypeUser
  status?: UserAccountStatus
}

export const DEFAULT_USERS_PAGE_SIZE = 20

/**
 * Monta params do `GET /users` a partir da busca + filtros da UI.
 * Status "Todos" (ausente) → envia todos os status (senão o back devolve só ACTIVE).
 */
export function toListUsersParams(
  search: string,
  filters: UsersListFilters,
  page = 0,
  size = DEFAULT_USERS_PAGE_SIZE,
): ListUsersParams {
  const trimmed = search.trim()
  const status = filters.status ? [filters.status] : ALL_USER_ACCOUNT_STATUSES

  return {
    page,
    size,
    status,
    ...(trimmed ? { name: trimmed } : {}),
    ...(filters.typeUser ? { typeUser: filters.typeUser } : {}),
  }
}

/** Normaliza valores crus dos selects ("todos" → undefined). */
export function normalizeUsersFilters(input: {
  typeUser: string | null
  status: string | null
}): UsersListFilters {
  const typeUser = isTypeUserFilter(input.typeUser) ? input.typeUser : undefined
  const status = isStatusFilter(input.status) ? input.status : undefined
  return {
    ...(typeUser ? { typeUser } : {}),
    ...(status ? { status } : {}),
  }
}
