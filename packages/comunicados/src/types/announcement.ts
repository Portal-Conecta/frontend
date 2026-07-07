/**
 * Announcement contracts — mirror the comunicados backend
 * (Portal-Conecta/comunicados-backend).
 *
 * Enum values are kept identical to the Java enums; the back (de)serializes by
 * name, so renaming a value here breaks the wire contract. Values live in
 * `as const` maps so the form layer can enumerate options at runtime, while the
 * matching union types stay type-safe.
 */

import type { AnnouncementFile } from './file'

export const ANNOUNCEMENT_ORIGIN = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'BOTH',
} as const

export type AnnouncementOrigin = (typeof ANNOUNCEMENT_ORIGIN)[keyof typeof ANNOUNCEMENT_ORIGIN]

export const ANNOUNCEMENT_DESTINATION_TYPE = {
  GENERAL: 'GENERAL',
  COURSE: 'COURSE',
  CLASS: 'CLASS',
  USER: 'USER',
} as const

export type AnnouncementDestinationType =
  (typeof ANNOUNCEMENT_DESTINATION_TYPE)[keyof typeof ANNOUNCEMENT_DESTINATION_TYPE]

export const ANNOUNCEMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  REMOVED: 'REMOVED',
} as const

export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUS)[keyof typeof ANNOUNCEMENT_STATUS]

/**
 * Destination carried in the same request that creates the announcement.
 * `referenceId` is required by the back whenever `type` is not GENERAL
 * (course/class/user id).
 */
export interface CreateAnnouncementDestinationInput {
  type: AnnouncementDestinationType
  referenceId?: string
}

/** Body of `POST /api/posts/publish` — creates and publishes in one transaction. */
export interface PublishAnnouncementRequest {
  title: string
  description: string
  origin: AnnouncementOrigin
  destinations: CreateAnnouncementDestinationInput[]
  pinned?: boolean
  tagIds?: string[]
}

/**
 * Body of `POST /api/posts/schedule` — creates and schedules in one transaction.
 * `scheduledFor` must be a future ISO-8601 instant (e.g. `2026-12-31T10:00:00Z`).
 */
export interface ScheduleAnnouncementRequest extends PublishAnnouncementRequest {
  scheduledFor: string
}

/** Announcement returned by the back on create/publish/schedule. */
export interface AnnouncementResponse {
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

/** Resumo consumido pelos cards/listas do mural. */
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
  tags?: readonly string[]
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
  announcement: AnnouncementResponse
  destinations: AnnouncementDestination[]
  files: AnnouncementFile[]
  tags: AnnouncementTag[]
  mentions: AnnouncementMention[]
}

/** Paginação de `GET /api/posts` (`ListAnnouncementsResponse`). */
export interface ListAnnouncementsResponse {
  items: AnnouncementDetail[]
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
  items: AnnouncementDetail[]
}
