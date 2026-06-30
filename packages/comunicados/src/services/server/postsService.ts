import type { ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'

const http = createHttpClient('COMUNICADOS_API_URL')

export async function listPosts(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>('/api/posts', {
    params: params as QueryParams,
  })
}
