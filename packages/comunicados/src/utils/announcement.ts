import {
  ANNOUNCEMENT_STATUS,
  type AnnouncementStatus,
} from '../types/announcement'
import type { AnnouncementOrigin, AnnouncementSummary } from '../types/announcement'

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

const announcementDateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

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

/** Data + hora em pt-BR; `null` quando iso ausente/inválido. */
export function formatAnnouncementDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return announcementDateTimeFormatter.format(date)
}

/**
 * Linha de status ao lado da origem (painel de gestão):
 * "Publicado em dd/mm/yyyy hh:mm" | "Agendado para dd/mm/yyyy hh:mm".
 */
export function formatAnnouncementStatusLine(
  post: Pick<AnnouncementSummary, 'status' | 'publishedAt' | 'scheduledFor'>,
): string | null {
  if (post.status === 'SCHEDULED') {
    const when = formatAnnouncementDateTime(post.scheduledFor)
    return when ? `Agendado para ${when}` : null
  }

  if (post.status === 'PUBLISHED') {
    // Só `publishedAt` — nunca cair em `scheduledFor`/`createdAt`.
    const when = formatAnnouncementDateTime(post.publishedAt)
    return when ? `Publicado em ${when}` : null
  }

  return null
}
