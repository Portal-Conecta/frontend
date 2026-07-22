import { bffFetch } from '../http/bffClient'
import { buildQuery } from '../http/query'
import type { TypeUser } from '../rbac'
import type { ListUsersResponse } from './types'

/**
 * Client-side de busca de usuários do sistema (`GET /api/users`) — usada pela
 * tela de adicionar usuários (#364) pra buscar alunos/professores disponíveis.
 */

export interface SearchUsersParams {
  typeUser?: TypeUser
  /** Busca parcial por nome (case-insensitive). */
  search?: string
  page?: number
  size?: number
  /** Restringe alunos/representantes a quem não tem turma ativa (ignorado para outros `typeUser`). */
  withoutActiveClass?: boolean
}

export function searchUsersClient(params: SearchUsersParams = {}): Promise<ListUsersResponse> {
  const query = buildQuery({
    typeUser: params.typeUser,
    search: params.search,
    page: params.page,
    size: params.size,
    withoutActiveClass: params.withoutActiveClass,
  })
  return bffFetch<ListUsersResponse>(`/api/users${query}`)
}
