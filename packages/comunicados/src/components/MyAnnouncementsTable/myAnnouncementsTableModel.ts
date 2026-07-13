import type { AnnouncementOrigin } from '../../types/announcement'

export const originLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

export function formatMyAnnouncementDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('pt-BR').format(date)
}
