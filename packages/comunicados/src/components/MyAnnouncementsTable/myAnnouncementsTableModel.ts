import type { AnnouncementOrigin, AnnouncementSummary } from '../../types/announcement'

export const originLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatMyAnnouncementDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return dateTimeFormatter.format(date)
}

/**
 * Linha de status ao lado da origem no card de gestão:
 * "Origem | Publicado em dd/mm/yyyy hh:mm" | "Origem | Agendado para dd/mm/yyyy hh:mm".
 */
export function formatAnnouncementStatusLine(
  post: Pick<AnnouncementSummary, 'status' | 'publishedAt' | 'scheduledFor'>,
): string | null {
  if (post.status === 'SCHEDULED') {
    const when = formatMyAnnouncementDateTime(post.scheduledFor)
    return when ? `Agendado para ${when}` : null
  }

  if (post.status === 'PUBLISHED') {
    // Só `publishedAt` — nunca cair em `scheduledFor`/`createdAt` (agendado
    // publicado agora via PUT precisa gravar publishedAt=now no back).
    const when = formatMyAnnouncementDateTime(post.publishedAt)
    return when ? `Publicado em ${when}` : null
  }

  return null
}

/** @deprecated Preferir `formatAnnouncementStatusLine`. */
export function formatMyAnnouncementDate(iso: string | null): string | null {
  return formatMyAnnouncementDateTime(iso)
}
