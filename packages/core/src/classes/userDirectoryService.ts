import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type { QueryParams } from '../http/query'
import type { TypeUser } from '../rbac'
import type { ListUsersResponse } from './types'

/**
 * Busca de usuários do sistema (`GET /hub/users`), usada pela tela de
 * "adicionar usuários" ao vincular alguém a uma turma. Server-only, mesmo
 * http client compartilhado dos demais services do core.
 *
 * O contrato do core só filtra por `typeUser` e pagina (`page`/`size`) — não há
 * busca textual por nome/email.
 */

export interface ListUsersParams {
  page?: number
  size?: number
  typeUser?: TypeUser
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
