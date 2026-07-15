import {
  ANNOUNCEMENT_STATUS,
  type AnnouncementOrigin,
  type AnnouncementStatus,
} from '../types/announcement'

const announcementOriginLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

const announcementDateFormatter = new Intl.DateTimeFormat('pt-BR')

export type AnnouncementDisplayDateFields = {
  status: AnnouncementStatus
  publishedAt: string | null
  scheduledFor: string | null
}

export function getAnnouncementOriginLabel(origin: AnnouncementOrigin): string {
  return announcementOriginLabel[origin]
}

export function formatAnnouncementDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return announcementDateFormatter.format(date)
}

/**
 * Data de exibição alinhada a Meus comunicados (#397):
 * - SCHEDULED → só `scheduledFor`
 * - PUBLISHED → só `publishedAt` (sem fallback para `createdAt` / `scheduledFor`)
 * - demais → `publishedAt`, senão `scheduledFor`
 */
export function resolveAnnouncementDisplayDate(
  announcement: AnnouncementDisplayDateFields,
): string | null {
  if (announcement.status === ANNOUNCEMENT_STATUS.SCHEDULED) {
    return announcement.scheduledFor
  }
  if (announcement.status === ANNOUNCEMENT_STATUS.PUBLISHED) {
    return announcement.publishedAt
  }
  return announcement.publishedAt ?? announcement.scheduledFor
}

/** Formata a data de exibição; `null` quando o status não tem instante utilizável. */
export function formatAnnouncementDisplayDate(
  announcement: AnnouncementDisplayDateFields,
): string | null {
  const iso = resolveAnnouncementDisplayDate(announcement)
  if (!iso) return null
  return formatAnnouncementDate(iso)
}
