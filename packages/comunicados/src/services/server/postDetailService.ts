import type { Announcement, AnnouncementFile, AnnouncementTag } from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'

const http = createHttpClient('COMUNICADOS_API_URL')

export async function getPost(id: string): Promise<Announcement> {
  return http.get<Announcement>(`/api/posts/${id}`)
}

export async function getPostTags(id: string): Promise<AnnouncementTag[]> {
  return http.get<AnnouncementTag[]>(`/api/posts/${id}/tags`)
}

export async function getPostImages(id: string): Promise<AnnouncementFile[]> {
  return http.get<AnnouncementFile[]>(`/api/posts/${id}/images`)
}
