import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type { QueryParams } from '../http/query'
import type { TypeUser } from '../rbac'
import type { ListUsersResponse, UserAccountStatus } from './types'

/**
 * Busca de usuários do sistema (`GET /hub/users`), usada pela tela de
 * "adicionar usuários" ao vincular alguém a uma turma e pelo seletor de
 * destinatários de comunicados. Server-only, mesmo http client compartilhado
 * dos demais services do core.
 *
 * O core filtra por `typeUser`, pagina (`page`/`size`), busca por nome
 * (`name`, substring case-insensitive) e status. Sem `status`, o backend
 * retorna somente usuários `ACTIVE`.
 */

export interface ListUsersParams {
  page?: number
  size?: number
  typeUser?: TypeUser
  /** Busca parcial por nome (case-insensitive), aplicada pelo core. */
  name?: string
  /** Um ou mais status de conta; ausente preserva o padrão `ACTIVE` do backend. */
  status?: UserAccountStatus[]
}

const http = createHttpClient('API_GATEWAY_URL')

export function searchUsers(
  params: ListUsersParams = {},
  token?: string,
): Promise<ListUsersResponse> {
  return http.get<ListUsersResponse>(hubGatewayPath('/users'), {
    params: params as QueryParams,
    ...(token ? { token } : {}),
  })
}
