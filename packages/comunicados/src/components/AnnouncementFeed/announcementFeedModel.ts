import { HttpError } from '@portal/core/http/errors'

import type { AnnouncementSummary } from '../../types/announcement'

/** Mescla páginas de `items` (não fixados), preservando ordem e substituindo duplicados por id. */
export function mergeAnnouncementFeedItems(
  current: AnnouncementSummary[],
  next: AnnouncementSummary[],
): AnnouncementSummary[] {
  const posts = new Map(current.map((post) => [post.id, post]))

  next.forEach((post) => {
    posts.set(post.id, post)
  })

  return Array.from(posts.values())
}

export function isAnnouncementFeedUnauthorizedError(error: Error | null): boolean {
  return error instanceof HttpError && error.kind === 'unauthorized'
}

export function resolveAnnouncementFeedErrorMessage(error: Error | null): string {
  if (error instanceof HttpError) {
    if (error.kind === 'network') {
      return 'Não foi possível carregar os comunicados. Verifique sua conexão e tente novamente.'
    }

    if (error.kind === 'forbidden') {
      return 'Você não tem permissão para ver estes comunicados.'
    }

    if (error.kind === 'not_found') {
      return 'Não foi possível encontrar os comunicados solicitados.'
    }
  }

  return 'Não foi possível carregar os comunicados. Tente novamente mais tarde.'
}
