import type { CurrentUser } from '@portal/core'

/**
 * Gate de UX — esconde/desabilita controles de edição do mapa de sala.
 * Espelha o @PreAuthorize do back:
 *   - ADMIN pode criar, mover, salvar e arquivar em qualquer turma.
 *   - TEACHER pode criar/mover/salvar/arquivar apenas na turma onde é TEACHER.
 *
 * O gate real é o 403 do backend. Divergência aqui degrada a experiência,
 * não a segurança.
 */
export function canEditRoomMap(user: CurrentUser | null, classId: string): boolean {
  if (!user) return false
  if (user.userType === 'ADMIN') return true
  return user.classes.some((c) => c.classId === classId && c.role === 'TEACHER')
}