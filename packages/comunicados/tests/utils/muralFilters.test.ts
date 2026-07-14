import { describe, expect, it } from 'vitest'

import type { AnnouncementSummary } from '../../src/types/announcement'
import type { Tag } from '../../src/types/tag'
import {
  announcementMatchesMuralFilters,
  findTagIdByHubEntity,
  resolveRequiredTagIds,
  toListPostsParams,
} from '../../src/utils/muralFilters'

const tags: Tag[] = [
  {
    id: 'tag-course-ds',
    name: 'DS',
    entityType: 'COURSE',
    hubEntityId: 'hub-course-ds',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-class-ds',
    name: 'DS 2026',
    entityType: 'CLASS',
    hubEntityId: 'hub-class-ds',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-shift-am',
    name: 'Manhã e tarde',
    entityType: 'SHIFT',
    hubEntityId: 'FULL_AM_PM',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('findTagIdByHubEntity', () => {
  it('resolve tag.id pelo hubEntityId + entityType', () => {
    expect(findTagIdByHubEntity(tags, 'COURSE', 'hub-course-ds')).toBe('tag-course-ds')
    expect(findTagIdByHubEntity(tags, 'SHIFT', 'FULL_AM_PM')).toBe('tag-shift-am')
  })

  it('aceita match pelo próprio tag.id', () => {
    expect(findTagIdByHubEntity(tags, 'COURSE', 'tag-course-ds')).toBe('tag-course-ds')
  })

  it('retorna undefined quando não encontra', () => {
    expect(findTagIdByHubEntity(tags, 'COURSE', 'missing')).toBeUndefined()
  })
})

describe('resolveRequiredTagIds / toListPostsParams', () => {
  it('mapeia curso e turno para UUIDs internos de tag (não hub id)', () => {
    const required = resolveRequiredTagIds(
      { curso: 'hub-course-ds', turno: 'FULL_AM_PM' },
      tags,
    )
    expect(required).toEqual(['tag-course-ds', 'tag-shift-am'])

    const params = toListPostsParams(
      { curso: 'hub-course-ds', turno: 'FULL_AM_PM' },
      '',
      tags,
    )
    expect(params.tagIds).toEqual(['tag-course-ds', 'tag-shift-am'])
    expect(params.tagId).toBeUndefined()
  })

  it('envia classId da turma sem exigir tag CLASS no wire de tags', () => {
    const params = toListPostsParams({ turma: 'hub-class-ds' }, 'retirada', tags)
    expect(params.classId).toBe('hub-class-ds')
    expect(params.tagId).toBeUndefined()
    expect(params.tagIds).toBeUndefined()
    expect(params.search).toBe('retirada')
  })

  it('mapeia origem para origin do back', () => {
    const params = toListPostsParams({ origem: 'SENAI' }, '', tags)
    expect(params.origin).toBe('SENAI')
  })
})

describe('announcementMatchesMuralFilters', () => {
  const post: AnnouncementSummary = {
    id: 'a1',
    title: 'T',
    description: 'D',
    origin: 'BOTH',
    status: 'PUBLISHED',
    pinned: false,
    pinnedOrder: null,
    scheduledFor: null,
    publishedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    thumbnailUrl: null,
    tags: [tags[0]!, tags[2]!],
  }

  it('exige curso e turno via hubEntityId nas tags do post (AND)', () => {
    expect(announcementMatchesMuralFilters(post, { curso: 'hub-course-ds' })).toBe(true)
    expect(
      announcementMatchesMuralFilters(post, {
        curso: 'hub-course-ds',
        turno: 'FULL_AM_PM',
      }),
    ).toBe(true)
    expect(
      announcementMatchesMuralFilters(post, {
        curso: 'hub-course-ds',
        turno: 'FULL_PM_NT',
      }),
    ).toBe(false)
  })

  it('filtra por origem', () => {
    expect(announcementMatchesMuralFilters(post, { origem: 'BOTH' })).toBe(true)
    expect(announcementMatchesMuralFilters(post, { origem: 'WEG' })).toBe(false)
  })
})
