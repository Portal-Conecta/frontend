import { describe, expect, it } from 'vitest'

import type { CurrentUser } from '@portal/core'

import { canEditAnnouncement } from '../../src/auth/canEditAnnouncement'
import {
  ANNOUNCEMENT_ORIGIN,
  ANNOUNCEMENT_STATUS,
  type AnnouncementDetail,
} from '../../src/types/announcement'

function user(
  overrides: Partial<CurrentUser> & Pick<CurrentUser, 'id' | 'userType'>,
): CurrentUser {
  return {
    classes: [],
    permissions: [],
    ...overrides,
  }
}

function detail(createdByUserId: string, status = ANNOUNCEMENT_STATUS.PUBLISHED): AnnouncementDetail {
  return {
    announcement: {
      id: 'a1',
      title: 'Título',
      description: '<p>Ok</p>',
      origin: ANNOUNCEMENT_ORIGIN.BOTH,
      status,
      pinned: false,
      pinnedOrder: null,
      createdByUserId,
      publishedByUserId: null,
      scheduledFor: null,
      publishedAt: '2026-01-01T00:00:00.000Z',
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

describe('canEditAnnouncement', () => {
  it('permite o autor com perfil criador', () => {
    expect(canEditAnnouncement(user({ id: 'u1', userType: 'TEACHER' }), detail('u1'))).toBe(true)
  })

  it('nega criador que não é o autor', () => {
    expect(canEditAnnouncement(user({ id: 'u2', userType: 'TEACHER' }), detail('u1'))).toBe(false)
  })

  it('nega aluno mesmo sendo o autor', () => {
    expect(canEditAnnouncement(user({ id: 'u1', userType: 'STUDENT' }), detail('u1'))).toBe(false)
  })

  it('nega comunicado removido', () => {
    expect(
      canEditAnnouncement(
        user({ id: 'u1', userType: 'ADMIN' }),
        detail('u1', ANNOUNCEMENT_STATUS.REMOVED),
      ),
    ).toBe(false)
  })

  it('nega sem user ou sem detalhe', () => {
    expect(canEditAnnouncement(null, detail('u1'))).toBe(false)
    expect(canEditAnnouncement(user({ id: 'u1', userType: 'TEACHER' }), null)).toBe(false)
  })
})
