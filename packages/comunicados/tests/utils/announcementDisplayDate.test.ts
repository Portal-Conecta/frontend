import { describe, expect, it } from 'vitest'

import {
  formatAnnouncementDisplayDate,
  resolveAnnouncementDisplayDate,
} from '../../src/utils/announcement'

describe('resolveAnnouncementDisplayDate', () => {
  it('SCHEDULED usa só scheduledFor', () => {
    expect(
      resolveAnnouncementDisplayDate({
        status: 'SCHEDULED',
        publishedAt: '2026-01-02T12:00:00.000Z',
        scheduledFor: '2026-06-01T15:00:00.000Z',
      }),
    ).toBe('2026-06-01T15:00:00.000Z')
  })

  it('PUBLISHED usa só publishedAt (sem fallback para scheduledFor)', () => {
    expect(
      resolveAnnouncementDisplayDate({
        status: 'PUBLISHED',
        publishedAt: '2026-01-02T12:00:00.000Z',
        scheduledFor: '2026-06-01T15:00:00.000Z',
      }),
    ).toBe('2026-01-02T12:00:00.000Z')

    expect(
      resolveAnnouncementDisplayDate({
        status: 'PUBLISHED',
        publishedAt: null,
        scheduledFor: '2026-06-01T15:00:00.000Z',
      }),
    ).toBeNull()
  })

  it('REMOVED prefere publishedAt e cai em scheduledFor', () => {
    expect(
      resolveAnnouncementDisplayDate({
        status: 'REMOVED',
        publishedAt: null,
        scheduledFor: '2026-06-01T15:00:00.000Z',
      }),
    ).toBe('2026-06-01T15:00:00.000Z')
  })
})

describe('formatAnnouncementDisplayDate', () => {
  it('formata publishedAt de comunicado publicado', () => {
    const label = formatAnnouncementDisplayDate({
      status: 'PUBLISHED',
      publishedAt: '2026-01-15T12:00:00.000Z',
      scheduledFor: null,
    })
    expect(label).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('retorna null quando PUBLISHED sem publishedAt', () => {
    expect(
      formatAnnouncementDisplayDate({
        status: 'PUBLISHED',
        publishedAt: null,
        scheduledFor: '2026-06-01T15:00:00.000Z',
      }),
    ).toBeNull()
  })
})
