import type { Tag, TagEntityType } from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

export interface ListTagsClientParams {
  entityType?: TagEntityType
}

/** Lista tags ativas via BFF (`GET /api/comunicados/tags`). */
export async function listTagsClient(params: ListTagsClientParams = {}): Promise<Tag[]> {
  return bffFetch<Tag[]>(`/api/comunicados/tags${buildQuery(params as QueryParams)}`)
}
