import { bffFetch } from '../http/bffClient'
import { buildQuery } from '../http/query'
import type { ListUsersResponse } from '../classes/types'
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
