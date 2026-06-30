import type { ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { comunicadosApiClient, type QueryParams } from './comunicadosApiClient'

export async function listPosts(
  params: ListPostsParams = {},
  accessToken: string,
): Promise<ListAnnouncementsResponse> {
  return comunicadosApiClient.get<ListAnnouncementsResponse>('/api/posts', {
    params: params as QueryParams,
    token: accessToken,
  })
}
