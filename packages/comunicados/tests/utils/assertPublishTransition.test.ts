import { describe, expect, it } from 'vitest'

import {
  assertPublishedAtAfterScheduleToPublish,
  MISSING_PUBLISHED_AT_AFTER_PUBLISH,
} from '../../src/utils/assertPublishTransition'
import type { AnnouncementDetail } from '../../src/types/announcement'

function detail(publishedAt: string | null): AnnouncementDetail {
  return {
    announcement: {
      id: 'a1',
      title: 'T',
      description: 'D',
      origin: 'BOTH',
      status: 'PUBLISHED',
      pinned: false,
      pinnedOrder: null,
      createdByUserId: 'u1',
      publishedByUserId: 'u1',
      scheduledFor: null,
      publishedAt,
      removedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    destinations: [],
    files: [],
    tags: [],
    mentions: [],
  }
}

describe('assertPublishedAtAfterScheduleToPublish', () => {
  it('não falha quando a transição não é SCHEDULED→PUBLISHED', () => {
    expect(() =>
      assertPublishedAtAfterScheduleToPublish(
        'PUBLISHED',
        { title: 'x' },
        detail(null),
      ),
    ).not.toThrow()
  })

  it('exige publishedAt após SCHEDULED→PUBLISHED', () => {
    expect(() =>
      assertPublishedAtAfterScheduleToPublish(
        'SCHEDULED',
        { status: 'PUBLISHED', scheduledFor: null },
        detail(null),
      ),
    ).toThrow(MISSING_PUBLISHED_AT_AFTER_PUBLISH)
  })

  it('aceita resposta com publishedAt preenchido', () => {
    expect(() =>
      assertPublishedAtAfterScheduleToPublish(
        'SCHEDULED',
        { status: 'PUBLISHED', scheduledFor: null },
        detail('2026-07-15T12:00:00.000Z'),
      ),
    ).not.toThrow()
  })
})
