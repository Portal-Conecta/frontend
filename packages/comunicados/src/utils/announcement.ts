import type { AnnouncementOrigin, AnnouncementSummary } from '../types/announcement'

const announcementOriginLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

const announcementDateFormatter = new Intl.DateTimeFormat('pt-BR')

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
