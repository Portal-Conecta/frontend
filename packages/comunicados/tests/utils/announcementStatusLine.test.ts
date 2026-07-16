import { describe, expect, it } from 'vitest'

import { formatAnnouncementStatusLine } from '../../src/utils/announcement'

describe('formatAnnouncementStatusLine', () => {
  it('PUBLISHED usa só publishedAt (não scheduledFor nem createdAt)', () => {
    const line = formatAnnouncementStatusLine({
      status: 'PUBLISHED',
      publishedAt: '2026-07-15T18:30:00.000Z',
      scheduledFor: '2026-12-01T15:00:00.000Z',
    })

    expect(line).toMatch(/^Publicado em /)
    expect(line).not.toContain('01/12/2026')
  })

  it('PUBLISHED sem publishedAt não inventa data a partir do agendamento', () => {
    expect(
      formatAnnouncementStatusLine({
        status: 'PUBLISHED',
        publishedAt: null,
        scheduledFor: '2026-12-01T15:00:00.000Z',
      }),
    ).toBeNull()
  })

  it('SCHEDULED usa scheduledFor', () => {
    const line = formatAnnouncementStatusLine({
      status: 'SCHEDULED',
      publishedAt: null,
      scheduledFor: '2026-12-01T15:00:00.000Z',
    })

    expect(line).toMatch(/^Agendado para /)
  })
})
