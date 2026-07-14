import type { Tag, TagEntityType } from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'
import { comunicadosGatewayPath } from '../comunicadosGateway'

const http = createHttpClient('API_GATEWAY_URL')

export interface ListTagsParams {
  entityType?: TagEntityType
}

/** Lista tags ativas (`GET /api/tags`), opcionalmente filtradas por `entityType`. */
export async function listTags(params: ListTagsParams = {}): Promise<Tag[]> {
  return http.get<Tag[]>(comunicadosGatewayPath('/api/tags'), {
    params: params as QueryParams,
  })
}
