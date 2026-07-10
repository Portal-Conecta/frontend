import { describe, expect, it } from 'vitest'

import { HttpError } from '@portal/core/http/errors'

import type { AnnouncementDetail, AnnouncementResponse } from '../../src/types/announcement'
import {
  getRegularAnnouncementPosts,
  isAnnouncementFeedUnauthorizedError,
  mergeAnnouncementFeedItems,
  resolveAnnouncementFeedErrorMessage,
  toAnnouncementSummary,
} from '../../src/components/AnnouncementFeed/announcementFeedModel'

function makeDetail(
  announcement: Partial<AnnouncementResponse> & Pick<AnnouncementResponse, 'id' | 'title'>,
): AnnouncementDetail {
  return {
    announcement: {
      description: 'Comunicado publicado no mural.',
      origin: 'SENAI',
      status: 'PUBLISHED',
      pinned: false,
      pinnedOrder: null,
      createdByUserId: 'u-1',
      publishedByUserId: 'u-1',
      scheduledFor: null,
      publishedAt: '2026-06-02T12:00:00.000Z',
      removedAt: null,
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T12:00:00.000Z',
      ...announcement,
    },
    destinations: [],
    files: [],
    tags: [],
    mentions: [],
  }
}

describe('announcementFeedModel', () => {
  it('mapeia AnnouncementDetail para o resumo consumido pelo card', () => {
    const post = makeDetail({ id: 'post-1', title: 'Aviso importante' })
    post.tags = [
      { announcementId: 'post-1', tagId: 'tag-1', tagName: 'Acadêmico' },
      { announcementId: 'post-1', tagId: 'tag-2', tagName: 'Urgente' },
    ]

    expect(toAnnouncementSummary(post)).toMatchObject({
      id: 'post-1',
      title: 'Aviso importante',
      origin: 'SENAI',
      pinned: false,
      tags: ['Acadêmico', 'Urgente'],
    })
  })

  it('omite tags quando o comunicado não tem tags', () => {
    const summary = toAnnouncementSummary(makeDetail({ id: 'post-1', title: 'Sem tags' }))

    expect(summary).not.toHaveProperty('tags')
  })

  it('mescla páginas preservando posts atuais e substituindo duplicados', () => {
    const current = [
      makeDetail({ id: 'post-1', title: 'Primeira versão' }),
      makeDetail({ id: 'post-2', title: 'Segundo comunicado' }),
    ]
    const next = [
      makeDetail({ id: 'post-2', title: 'Segundo comunicado atualizado' }),
      makeDetail({ id: 'post-3', title: 'Terceiro comunicado' }),
    ]

    expect(mergeAnnouncementFeedItems(current, next).map((post) => post.announcement)).toMatchObject([
      { id: 'post-1', title: 'Primeira versão' },
      { id: 'post-2', title: 'Segundo comunicado atualizado' },
      { id: 'post-3', title: 'Terceiro comunicado' },
    ])
  })

  it('separa comunicados fixados da lista regular', () => {
    const posts = [
      makeDetail({ id: 'fixado', title: 'Fixado', pinned: true }),
      makeDetail({ id: 'regular', title: 'Regular' }),
    ]

    expect(getRegularAnnouncementPosts(posts).map((post) => post.announcement.id)).toEqual([
      'regular',
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