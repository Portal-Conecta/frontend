import { describe, expect, it } from 'vitest'

import { getAnnouncementPlainDescription } from '../../src/utils/announcementDescription'

describe('getAnnouncementPlainDescription', () => {
  it('usa descriptionPlain quando presente', () => {
    expect(
      getAnnouncementPlainDescription({
        description: '<p>HTML ignorado</p>',
        descriptionPlain: 'Prévia já em texto puro',
      }),
    ).toBe('Prévia já em texto puro')
  })

  it('converte description (HTML) pra texto puro quando descriptionPlain está ausente', () => {
    expect(
      getAnnouncementPlainDescription({
        description: '<p>Aviso importante</p>',
      }),
    ).toBe('Aviso importante')
  })

  it('converte description quando descriptionPlain vem em branco', () => {
    expect(
      getAnnouncementPlainDescription({
        description: '<p>y</p>',
        descriptionPlain: '   ',
      }),
    ).toBe('y')
  })
})
