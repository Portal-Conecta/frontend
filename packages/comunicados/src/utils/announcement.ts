import type { AnnouncementOrigin } from '../types/announcement'

const announcementOriginLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

const announcementDateFormatter = new Intl.DateTimeFormat('pt-BR')

export function getAnnouncementOriginLabel(origin: AnnouncementOrigin): string {
  return announcementOriginLabel[origin]
}

export function formatAnnouncementDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return announcementDateFormatter.format(date)
}
