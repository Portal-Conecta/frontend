import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type { QueryParams } from '../http/query'
import type { TypeUser } from '../rbac'
import type { ListUsersResponse } from './types'

/**
 * Busca de usuários do sistema (`GET /hub/users`), usada pela tela de
 * "adicionar usuários" ao vincular alguém a uma turma e pelo seletor de
 * destinatários de comunicados. Server-only, mesmo http client compartilhado
 * dos demais services do core.
 *
 * O core filtra por `typeUser`, pagina (`page`/`size`) e busca por nome
 * (`name`, substring case-insensitive, `LIKE %valor%` restrito a usuários
 * `ACTIVE` — ver `GetAllUserUseCase`/`UserRepository` no core-backend).
 */

export interface ListUsersParams {
  page?: number
  size?: number
  typeUser?: TypeUser
  /** Busca parcial por nome (case-insensitive), aplicada pelo core. */
  name?: string
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
