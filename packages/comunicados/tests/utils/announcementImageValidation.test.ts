import { describe, expect, it } from 'vitest'

import { ANNOUNCEMENT_IMAGE_MAX_BYTES } from '../../src/constants/announcementImageLimits'
import {
  validateAnnouncementImageFile,
  validateAnnouncementImagePresign,
} from '../../src/utils/announcementImageValidation'

describe('validateAnnouncementImageFile', () => {
  it('aceita PNG dentro do limite', () => {
    expect(
      validateAnnouncementImageFile({ type: 'image/png', size: 1024 }),
    ).toBeNull()
  })

  it('rejeita MIME fora da allowlist', () => {
    const error = validateAnnouncementImageFile({ type: 'application/pdf', size: 10 })
    expect(error?.code).toBe('mime')
  })

  it('rejeita arquivo acima de ANNOUNCEMENT_IMAGE_MAX_BYTES', () => {
    const error = validateAnnouncementImageFile({
      type: 'image/jpeg',
      size: ANNOUNCEMENT_IMAGE_MAX_BYTES + 1,
    })
    expect(error?.code).toBe('size')
  })

  it('rejeita vazio', () => {
    expect(validateAnnouncementImageFile({ type: 'image/png', size: 0 })?.code).toBe('empty')
  })
})

describe('validateAnnouncementImagePresign', () => {
  it('aceita contentType válido', () => {
    expect(
      validateAnnouncementImagePresign({ contentType: 'image/webp', sizeBytes: 100 }),
    ).toBeNull()
  })

  it('rejeita contentType inválido', () => {
    expect(validateAnnouncementImagePresign({ contentType: 'text/plain' })?.code).toBe('mime')
  })

  it('rejeita sizeBytes acima do teto', () => {
    expect(
      validateAnnouncementImagePresign({
        contentType: 'image/png',
        sizeBytes: ANNOUNCEMENT_IMAGE_MAX_BYTES + 1,
      })?.code,
    ).toBe('size')
  })
})
