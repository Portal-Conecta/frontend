import { bffFetch } from '../http/bffClient'
import { buildQuery } from '../http/query'
import type { ListUsersResponse } from '../classes/types'
import type { CreateUserPayload, UpdateUserPayload, UserById, UserLifecycleResult } from '../profile/types'
import type { TypeUser } from '../rbac'
import type { UserAccountStatus } from '../classes/types'

/**
 * Client-side do diretório de usuários — consumido pela lista (#440) via BFF
 * (`GET /api/users`). Erros chegam como `HttpError` (ver `bffFetch`).
 */

export interface ListUsersClientParams {
  page?: number
  size?: number
  typeUser?: TypeUser
  /** Busca parcial por nome. */
  search?: string
  /** Um ou mais status; ausente preserva o padrão `ACTIVE` do backend. */
  status?: UserAccountStatus[]
}

/** Lista usuários paginados (`GET /api/users`). */
export function listUsersClient(params: ListUsersClientParams = {}): Promise<ListUsersResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    typeUser: params.typeUser,
    search: params.search,
    status: params.status,
  })
  return bffFetch<ListUsersResponse>(`/api/users${query}`)
}

/** Cria um usuário (#441) — `POST /api/users`. */
export function createUserClient(payload: CreateUserPayload): Promise<UserById> {
  return bffFetch<UserById>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Atualiza o nome do usuário (#442) — `PATCH /api/users/{id}`, único campo aceito pelo Hub. */
export function updateUserClient(userId: string, payload: UpdateUserPayload): Promise<UserById> {
  return bffFetch<UserById>(`/api/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/** Desativa o usuário (#442) — `POST /api/users/{id}/deactivate`, bloqueia login, reversível. */
export function deactivateUserClient(userId: string): Promise<UserLifecycleResult> {
  return bffFetch<UserLifecycleResult>(`/api/users/${encodeURIComponent(userId)}/deactivate`, {
    method: 'POST',
  })
}

/** Reativa o usuário (#442) — `POST /api/users/{id}/reactivate`. */
export function reactivateUserClient(userId: string): Promise<UserLifecycleResult> {
  return bffFetch<UserLifecycleResult>(`/api/users/${encodeURIComponent(userId)}/reactivate`, {
    method: 'POST',
  })
}

/** Marca o usuário para exclusão (#442) — `DELETE /api/users/{id}`, `PENDING_DELETION`, purge futuro. */
export function deleteUserClient(userId: string): Promise<UserLifecycleResult> {
  return bffFetch<UserLifecycleResult>(`/api/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
}
