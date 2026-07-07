import type { ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'

import { comunicadosGatewayPath } from '../comunicadosGateway'

const http = createHttpClient('API_GATEWAY_URL')

export async function listPosts(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>(comunicadosGatewayPath('/api/posts'), {
    params: params as QueryParams,
  })
}
