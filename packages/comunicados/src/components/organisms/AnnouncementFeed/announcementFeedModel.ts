import type { AnnouncementDetail, AnnouncementSummary } from '../../../types/announcement'

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
