import type { CurrentUser } from '@portal/core'

/**
 * Perfis autorizados a criar comunicados (gestores + professores + representante
 * de turma, com escopo restrito — RN-COM-PA02/PA03). Gate de UX na página —
 * o 403 do BFF continua sendo a fonte da verdade.
 */
const CREATOR_USER_TYPES = new Set<CurrentUser['userType']>([
  'TEACHER',
  'REPRESENTATIVE',
  'SENAI',
  'WEG',
  'ADMIN',
])

export function canCreateAnnouncement(user: CurrentUser | null | undefined): boolean {
  return user != null && CREATOR_USER_TYPES.has(user.userType)
}
