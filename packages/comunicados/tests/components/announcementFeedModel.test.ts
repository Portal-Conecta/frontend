import { describe, expect, it } from 'vitest'

import { HttpError } from '@portal/core/http/errors'

import type { AnnouncementSummary } from '../../src/types/announcement'
import {
  isAnnouncementFeedUnauthorizedError,
  mergeAnnouncementFeedItems,
  resolveAnnouncementFeedErrorMessage,
} from '../../src/components/AnnouncementFeed/announcementFeedModel'

function makeSummary(
  partial: Partial<AnnouncementSummary> & Pick<AnnouncementSummary, 'id' | 'title'>,
): AnnouncementSummary {
  return {
    description: 'Comunicado publicado no mural.',
    origin: 'SENAI',
    status: 'PUBLISHED',
    pinned: false,
    pinnedOrder: null,
    scheduledFor: null,
    publishedAt: '2026-06-02T12:00:00.000Z',
    createdAt: '2026-06-02T12:00:00.000Z',
    thumbnailUrl: null,
    ...partial,
  }
}

describe('announcementFeedModel', () => {
  it('mescla páginas preservando posts atuais e substituindo duplicados', () => {
    const current = [
      makeSummary({ id: 'post-1', title: 'Primeira versão' }),
      makeSummary({ id: 'post-2', title: 'Segundo comunicado' }),
    ]
    const next = [
      makeSummary({ id: 'post-2', title: 'Segundo comunicado atualizado' }),
      makeSummary({ id: 'post-3', title: 'Terceiro comunicado' }),
    ]

    expect(mergeAnnouncementFeedItems(current, next)).toMatchObject([
      { id: 'post-1', title: 'Primeira versão' },
      { id: 'post-2', title: 'Segundo comunicado atualizado' },
      { id: 'post-3', title: 'Terceiro comunicado' },
    ])
  })

  it('identifica erro unauthorized para redirecionamento de sessão expirada', () => {
    expect(isAnnouncementFeedUnauthorizedError(new HttpError('unauthorized'))).toBe(true)
    expect(isAnnouncementFeedUnauthorizedError(new HttpError('forbidden'))).toBe(false)
    expect(isAnnouncementFeedUnauthorizedError(new Error('posts_list_error'))).toBe(false)
  })

  it('resolve mensagens de erro por kind do HttpError', () => {
    expect(resolveAnnouncementFeedErrorMessage(new HttpError('network'))).toBe(
      'Não foi possível carregar os comunicados. Verifique sua conexão e tente novamente.',
    )
    expect(resolveAnnouncementFeedErrorMessage(new HttpError('forbidden'))).toBe(
      'Você não tem permissão para ver estes comunicados.',
    )
    expect(resolveAnnouncementFeedErrorMessage(new HttpError('not_found'))).toBe(
      'Não foi possível encontrar os comunicados solicitados.',
    )
    expect(resolveAnnouncementFeedErrorMessage(new Error('posts_list_error'))).toBe(
      'Não foi possível carregar os comunicados. Tente novamente mais tarde.',
    )
  })
})
