import type { AnnouncementDetail, AnnouncementOrigin } from '../../types/announcement'

export const originLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

/** Exclui os fixados — já exibidos separadamente na seção de fixados (#189). */
export function getMyRegularPosts(posts: AnnouncementDetail[]): AnnouncementDetail[] {
  return posts.filter((post) => !post.announcement.pinned)
}

export function formatMyAnnouncementDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('pt-BR').format(date)
}
