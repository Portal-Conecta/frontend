import type { AnnouncementDetail, AnnouncementUpdatePayload, ListAnnouncementsResponse, ListPostsParams } from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'

const http = createHttpClient('COMUNICADOS_API_URL')

export async function listPosts(params: ListPostsParams = {}): Promise<ListAnnouncementsResponse> {
  return http.get<ListAnnouncementsResponse>('/api/posts', {
    params: params as QueryParams,
  })
}

export async function getAnnouncement(id: string): Promise<AnnouncementDetail> {
  return http.get<AnnouncementDetail>(`/api/posts/${id}`)
}

export async function updateAnnouncement(
  id: string,
  payload: AnnouncementUpdatePayload,
): Promise<AnnouncementDetail> {
  const { destinations: _, ...body } = payload

  return http.put<AnnouncementDetail>(`/api/posts/${id}`, {
    body,
  })
}

export async function rescheduleAnnouncement(id: string, scheduledFor: string): Promise<AnnouncementDetail> {
  return http.patch<AnnouncementDetail>(`/api/posts/${id}/schedule`, {
    body: { scheduledFor },
  })
}