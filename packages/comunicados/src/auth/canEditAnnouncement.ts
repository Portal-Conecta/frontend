import type { CurrentUser } from '@portal/core'

import type { AnnouncementDetail } from '../types/announcement'
import { ANNOUNCEMENT_STATUS } from '../types/announcement'
import { canCreateAnnouncement } from './canCreateAnnouncement'

/**
 * Gate de UX para editar: perfil criador + autor do comunicado + não removido.
 * Espelha o critério do link "Editar" no detalhe. O 403 do BFF no PUT/PATCH
 * permanece a fonte da verdade no back.
 */
export function canEditAnnouncement(
  user: CurrentUser | null | undefined,
  detail: AnnouncementDetail | null | undefined,
): boolean {
  if (!user || !detail) return false
  if (!canCreateAnnouncement(user)) return false
  if (user.id !== detail.announcement.createdByUserId) return false
  if (detail.announcement.status === ANNOUNCEMENT_STATUS.REMOVED) return false
  return true
}
