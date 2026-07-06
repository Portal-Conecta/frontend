import type {
  ListAnnouncementsResponse,
  ListPostsParams,
  AnnouncementDetail,
  AnnouncementTag,
  AnnouncementFile,
} from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

/** Lista posts via BFF (`GET /api/comunicados/posts`) — uso no browser. */
export async function listPostsClient(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return bffFetch<ListAnnouncementsResponse>(
    `/api/comunicados/posts${buildQuery(params as QueryParams)}`,
  )
}

export async function getPostDetailClient(id: string): Promise<AnnouncementDetail> {
  return bffFetch<AnnouncementDetail>(`/api/comunicados/posts/${id}`)
}

export async function getPostTagsClient(id: string): Promise<AnnouncementTag[]> {
  return bffFetch<AnnouncementTag[]>(`/api/comunicados/posts/${id}/tags`)
}

export async function getPostImagesClient(id: string): Promise<AnnouncementFile[]> {
  return bffFetch<AnnouncementFile[]>(`/api/comunicados/posts/${id}/images`)
}
