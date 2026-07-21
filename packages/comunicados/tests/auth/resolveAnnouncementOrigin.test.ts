import { describe, expect, it } from 'vitest'

import { resolveAnnouncementOrigin } from '../../src/auth/resolveAnnouncementOrigin'
import { ANNOUNCEMENT_ORIGIN } from '../../src/types/announcement'

describe('resolveAnnouncementOrigin', () => {
  it('WEG publica como WEG', () => {
    expect(resolveAnnouncementOrigin('WEG')).toBe(ANNOUNCEMENT_ORIGIN.WEG)
  })

  it('docente e SENAI publicam como SENAI', () => {
    expect(resolveAnnouncementOrigin('TEACHER')).toBe(ANNOUNCEMENT_ORIGIN.SENAI)
    expect(resolveAnnouncementOrigin('SENAI')).toBe(ANNOUNCEMENT_ORIGIN.SENAI)
  })

  it('representante e ADMIN publicam como BOTH (WEG + SENAI)', () => {
    expect(resolveAnnouncementOrigin('REPRESENTATIVE')).toBe(ANNOUNCEMENT_ORIGIN.BOTH)
    expect(resolveAnnouncementOrigin('ADMIN')).toBe(ANNOUNCEMENT_ORIGIN.BOTH)
  })

  it('fallback BOTH para perfil sem regra ou ausente', () => {
    expect(resolveAnnouncementOrigin('STUDENT')).toBe(ANNOUNCEMENT_ORIGIN.BOTH)
    expect(resolveAnnouncementOrigin(null)).toBe(ANNOUNCEMENT_ORIGIN.BOTH)
    expect(resolveAnnouncementOrigin(undefined)).toBe(ANNOUNCEMENT_ORIGIN.BOTH)
  })
})
