import type { Announcement, AnnouncementFile, AnnouncementTag } from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'

export async function getPostClient(id: string): Promise<Announcement> {
  return bffFetch<Announcement>(`/api/comunicados/posts/${id}`)
}

export async function getPostTagsClient(id: string): Promise<AnnouncementTag[]> {
  return bffFetch<AnnouncementTag[]>(`/api/comunicados/posts/${id}/tags`)
}

export async function getPostImagesClient(id: string): Promise<AnnouncementFile[]> {
  return bffFetch<AnnouncementFile[]>(`/api/comunicados/posts/${id}/images`)
}
