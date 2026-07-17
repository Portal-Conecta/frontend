import type { CurrentUser } from '@portal/core'

import { ANNOUNCEMENT_ORIGIN, type AnnouncementOrigin } from '../types/announcement'

/**
 * Origem do comunicado na criação, a partir do perfil do autor:
 * - WEG → `WEG`
 * - TEACHER / SENAI → `SENAI`
 * - REPRESENTATIVE / ADMIN → `BOTH` (WEG + SENAI)
 *
 * Perfis que não criam (ex.: STUDENT) caem em `BOTH` só como fallback seguro —
 * a página já bloqueia com `canCreateAnnouncement`.
 */
export function resolveAnnouncementOrigin(
  userType: CurrentUser['userType'] | null | undefined,
): AnnouncementOrigin {
  switch (userType) {
    case 'WEG':
      return ANNOUNCEMENT_ORIGIN.WEG
    case 'TEACHER':
    case 'SENAI':
      return ANNOUNCEMENT_ORIGIN.SENAI
    case 'REPRESENTATIVE':
    case 'ADMIN':
      return ANNOUNCEMENT_ORIGIN.BOTH
    default:
      return ANNOUNCEMENT_ORIGIN.BOTH
  }
}
