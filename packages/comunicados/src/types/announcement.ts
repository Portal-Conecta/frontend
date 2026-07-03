/**
 * Announcement contracts — mirror the comunicados backend
 * (Portal-Conecta/comunicados-backend).
 *
 * Enum values are kept identical to the Java enums; the back (de)serializes by
 * name, so renaming a value here breaks the wire contract. Values live in
 * `as const` maps so the form layer can enumerate options at runtime, while the
 * matching union types stay type-safe.
 */

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

/** Single field error inside a 400 validation `ApiError`. */
export interface FieldErrorDetail {
  field: string
  message: string
}

/** Error envelope returned by the comunicados backend on any non-2xx status. */
export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  errors?: FieldErrorDetail[]
}
