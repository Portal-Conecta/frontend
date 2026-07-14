import type { AnnouncementSummary } from '../types/announcement'

/** Prévia plain-text para mural/cards (`descriptionPlain` com fallback). */
export function getAnnouncementPlainDescription(
  post: Pick<AnnouncementSummary, 'description' | 'descriptionPlain'>,
): string {
  return post.descriptionPlain?.trim() || post.description
}
