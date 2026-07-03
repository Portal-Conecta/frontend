import type { AnnouncementFile } from './file'

/** Espelha `AnnouncementStatus` do comunicados-backend. */
export type AnnouncementStatus = 'SCHEDULED' | 'PUBLISHED' | 'REMOVED'

/** Espelha `AnnouncementOrigin` do comunicados-backend. */
export type AnnouncementOrigin = 'WEG' | 'SENAI' | 'BOTH'

/** Espelha `AnnouncementDestinationType` do comunicados-backend. */
export type AnnouncementDestinationType = 'GENERAL' | 'COURSE' | 'CLASS' | 'USER'

/** Resumo retornado em `GET /api/posts` (`AnnouncementSummaryResponse`). */
export interface AnnouncementSummary {
  id: string
  title: string
  description: string
  origin: AnnouncementOrigin
  status: AnnouncementStatus
  pinned: boolean
  pinnedOrder: number | null
  scheduledFor: string | null
  publishedAt: string | null
  createdAt: string
}

/** Corpo completo (`AnnouncementResponse`). */
export interface Announcement {
  id: string
  title: string
  description: string
  origin: AnnouncementOrigin
  status: AnnouncementStatus
  pinned: boolean
  pinnedOrder: number | null
  createdByUserId: string
  publishedByUserId: string | null
  scheduledFor: string | null
  publishedAt: string | null
  removedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AnnouncementDestination {
  id: string
  announcementId: string
  type: AnnouncementDestinationType
  referenceId: string | null
}

export interface AnnouncementTag {
  announcementId: string
  tagId: string
  tagName: string
}

export interface AnnouncementMention {
  announcementId: string
  userId: string
}

/** Detalhe (`AnnouncementDetailResponse`). */
export interface AnnouncementDetail {
  announcement: Announcement
  destinations: AnnouncementDestination[]
  files: AnnouncementFile[]
  tags: AnnouncementTag[]
  mentions: AnnouncementMention[]
}

/** Paginação de `GET /api/posts` (`ListAnnouncementsResponse`). */
export interface ListAnnouncementsResponse {
  items: AnnouncementSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** Query de `PostFilterRequest` — `page` é zero-based no back. */
export interface ListPostsParams {
  page?: number
  size?: number
  search?: string
  origin?: AnnouncementOrigin
  filterType?: string
  classId?: string
  publishedFrom?: string
  publishedTo?: string
  tagId?: string
  tagIds?: string[]
}

export interface ListPinnedAnnouncementsResponse {
  items: AnnouncementSummary[]
}
