import { describe, expect, it } from 'vitest'

import { validateAnnouncementContent } from '../../src/components/AnnouncementForm/validateAnnouncementContent'
import { EMPTY_ANNOUNCEMENT_CONTENT } from '../../src/components/AnnouncementForm/types'

describe('validateAnnouncementContent', () => {
  it('exige título e descrição', () => {
    expect(validateAnnouncementContent(EMPTY_ANNOUNCEMENT_CONTENT)).toEqual({
      title: 'O título é obrigatório.',
      description: 'A descrição é obrigatória.',
    })
  })

  it('rejeita título acima de 255 caracteres', () => {
    expect(
      validateAnnouncementContent({
        ...EMPTY_ANNOUNCEMENT_CONTENT,
        title: 'a'.repeat(256),
        description: 'Descrição ok',
      }),
    ).toEqual({
      title: 'O título deve ter no máximo 255 caracteres.',
    })
  })

  it('aceita descrição longa', () => {
    expect(
      validateAnnouncementContent({
        ...EMPTY_ANNOUNCEMENT_CONTENT,
        title: 'Comunicado',
        description: 'a'.repeat(500),
      }),
    ).toEqual({})
  })
})
