/**
 * Announcement contracts — mirror the comunicados backend
 * (Portal-Conecta/comunicados-backend).
 *
 * Enum values are kept identical to the Java enums; the back (de)serializes by
 * name, so renaming a value here breaks the wire contract. Values live in
 * `as const` maps so the form layer can enumerate options at runtime, while the
 * matching union types stay type-safe.
 */

import type { HubShift } from '@portal/shared'

import type { AnnouncementFile } from './file'
import type { Tag } from './tag'

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

/**
 * Papéis opcionais no publish/schedule (`roles`). Vazio/omitido = sem restrição
 * de papel (visível a qualquer `UserType` no escopo espacial). Viram tag `ROLE`
 * no back (`hub_entity_id` = nome do enum).
 */
export const ANNOUNCEMENT_ROLE = {
  STUDENT: 'STUDENT',
  REPRESENTATIVE: 'REPRESENTATIVE',
  TEACHER: 'TEACHER',
  SENAI: 'SENAI',
  WEG: 'WEG',
  ADMIN: 'ADMIN',
} as const

export type AnnouncementRole = (typeof ANNOUNCEMENT_ROLE)[keyof typeof ANNOUNCEMENT_ROLE]

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
  /** UUIDs internos da tabela tag (`tag.id`), não `hub_entity_id`. */
  tagIds?: string[]
  /** Turnos do Core (`FULL_AM_PM` / `FULL_PM_NT`). */
  shiftCodes?: HubShift[]
  /**
   * Papéis que podem ver o comunicado. Opcional; omitido/vazio = sem restrição
   * de papel. Ex.: `["STUDENT"]` com destino GENERAL = “todos os alunos”.
   */
  roles?: AnnouncementRole[]
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
  /** Conteúdo HTML sanitizado (TipTap). */
  description: string
  /** Versão plain-text gerada no servidor. */
  descriptionPlain?: string
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
  /**
   * Prévia plain-text na listagem (compatível com `descriptionPlain`).
   * Preferir `descriptionPlain` quando disponível.
   */
  description: string
  /** Versão plain-text recomendada para preview (mural/cards/tabela). Preferir a `description` quando ausente. */
  descriptionPlain?: string
  origin: AnnouncementOrigin
  status: AnnouncementStatus
  pinned: boolean
  pinnedOrder: number | null
  scheduledFor: string | null
  publishedAt: string | null
  createdAt: string
  /** URL da miniatura na listagem (`GET /api/posts`). `null` quando não há imagem. */
  thumbnailUrl: string | null
  /** Tags vinculadas ao comunicado (`TagResponse` — curso, turma, turno, etc.). */
  tags?: readonly Tag[]
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

/**
 * Body parcial de `PUT /api/posts/{id}` (`UpdateAnnouncementRequest`).
 *
 * Limitação OpenAPI (#397): o PUT aceita `destinations`, mas **não** expõe
 * `tagIds`, `shiftCodes` nem `roles`. Alterar turnos/tags/papéis na edição
 * exige extensão do contrato no comunicados-backend; até lá o front só
 * atualiza campos listados (papéis ficam como na criação).
 */
export interface AnnouncementUpdatePayload {
  title?: string
  description?: string
  origin?: AnnouncementOrigin
  status?: AnnouncementStatus
  pinned?: boolean
  pinnedOrder?: number | null
  scheduledFor?: string | null
  destinations?: CreateAnnouncementDestinationInput[]
}

/**
 * Listagem do mural (`GET /api/posts` — `ListAnnouncementsResponse`).
 * O back devolve dois arrays de resumo: `pinned` (fixados, sem paginação) e
 * `items` (não fixados, paginados). A paginação refere-se só a `items`.
 */
export interface ListAnnouncementsResponse {
  pinned: AnnouncementSummary[]
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
  status?: AnnouncementStatus
  origin?: AnnouncementOrigin
  classId?: string
  publishedFrom?: string
  publishedTo?: string
  tagId?: string
  tagIds?: string[]
}

export interface ListPinnedAnnouncementsResponse {
  items: AnnouncementSummary[]
}
