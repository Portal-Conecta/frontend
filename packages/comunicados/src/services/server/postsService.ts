import type {
  ListAnnouncementsResponse,
  ListPostsParams,
  AnnouncementDetail,
  AnnouncementTag,
  AnnouncementFile,
} from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'

const http = createHttpClient('COMUNICADOS_API_URL')

export async function listPosts(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>('/api/posts', {
    params: params as QueryParams,
  })
}

export async function getPostDetail(id: string): Promise<AnnouncementDetail> {
  return http.get<AnnouncementDetail>(`/api/posts/${id}`)
}

export async function getPostTags(id: string): Promise<AnnouncementTag[]> {
  return http.get<AnnouncementTag[]>(`/api/posts/${id}/tags`)
}

export async function getPostImages(id: string): Promise<AnnouncementFile[]> {
  return http.get<AnnouncementFile[]>(`/api/posts/${id}/images`)
}
