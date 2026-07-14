import { richTextHtmlToPlain } from '@portal/ui'

import type { AnnouncementContentErrors, AnnouncementContentValue } from './types'
import { ANNOUNCEMENT_TITLE_MAX_LENGTH } from '../../constants/announcementFieldLimits'

export function validateAnnouncementContent(
  content: AnnouncementContentValue,
): AnnouncementContentErrors {
  const errors: AnnouncementContentErrors = {}
  const title = content.title.trim()

  if (!title) {
    errors.title = 'O título é obrigatório.'
  } else if (title.length > ANNOUNCEMENT_TITLE_MAX_LENGTH) {
    errors.title = `O título deve ter no máximo ${ANNOUNCEMENT_TITLE_MAX_LENGTH} caracteres.`
  }

  if (!richTextHtmlToPlain(content.description)) {
    errors.description = 'A descrição é obrigatória.'
  }

  return errors
}
