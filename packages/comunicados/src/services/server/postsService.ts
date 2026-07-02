import { comunicadosApiClient } from './comunicadosApiClient'
import type { ListAnnouncementsResponse, ListPostsParams } from '../../types/posts'

export async function listPosts(params: ListPostsParams, token: string): Promise<ListAnnouncementsResponse> {
  return comunicadosApiClient.get<ListAnnouncementsResponse>('/api/posts', { params, token })
}
