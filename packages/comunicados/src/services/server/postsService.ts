import type { ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { type QueryParams } from '../query'
import { postsApiClient } from './postsApiClient'

export async function listPosts(
  params: ListPostsParams = {},
  accessToken: string,
): Promise<ListAnnouncementsResponse> {
  return postsApiClient.get<ListAnnouncementsResponse>('/api/posts', {
    params: params as QueryParams,
    token: accessToken,
  })
}
