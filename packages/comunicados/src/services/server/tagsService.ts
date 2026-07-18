import type { Tag, TagEntityType } from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'
import { comunicadosGatewayPath } from '../comunicadosGateway'

const http = createHttpClient('API_GATEWAY_URL')

/** Catálogo quase estático (tags) — TTL adotado pelo time (#406). */
const TAGS_REVALIDATE_SECONDS = 60

export interface ListTagsParams {
  entityType?: TagEntityType
}

/** Lista tags ativas (`GET /api/tags`), opcionalmente filtradas por `entityType`. */
export async function listTags(params: ListTagsParams = {}): Promise<Tag[]> {
  return http.get<Tag[]>(comunicadosGatewayPath('/api/tags'), {
    params: params as QueryParams,
    // tag pra revalidateTag futuro, se/quando existir mutation deste catálogo neste front — nenhuma hoje (#406)
    next: { revalidate: TAGS_REVALIDATE_SECONDS, tags: ['comunicados-tags'] },
  })
}
