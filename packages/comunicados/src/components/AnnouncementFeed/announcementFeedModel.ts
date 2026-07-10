import { HttpError } from '@portal/core/http/errors'

import type { AnnouncementDetail, AnnouncementSummary } from '../../types/announcement'

export function toAnnouncementSummary(post: AnnouncementDetail): AnnouncementSummary {
  const tagNames = post.tags.map((tag) => tag.tagName)

  const summary: AnnouncementSummary = {
    id: post.announcement.id,
    title: post.announcement.title,
    description: post.announcement.description,
    origin: post.announcement.origin,
    status: post.announcement.status,
    pinned: post.announcement.pinned,
    pinnedOrder: post.announcement.pinnedOrder,
    scheduledFor: post.announcement.scheduledFor,
    publishedAt: post.announcement.publishedAt,
    createdAt: post.announcement.createdAt,
  }

  if (tagNames.length > 0) {
    summary.tags = tagNames
  }

  return summary
}

export function mergeAnnouncementFeedItems(
  current: AnnouncementDetail[],
  next: AnnouncementDetail[],
): AnnouncementDetail[] {
  const posts = new Map(current.map((post) => [post.announcement.id, post]))

  next.forEach((post) => {
    posts.set(post.announcement.id, post)
  })

  return Array.from(posts.values())
}

export function getRegularAnnouncementPosts(posts: AnnouncementDetail[]): AnnouncementDetail[] {
  return posts.filter((post) => !post.announcement.pinned)
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