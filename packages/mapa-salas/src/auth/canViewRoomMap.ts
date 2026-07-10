import { can, type CurrentUser } from '@portal/core'

/**
 * Gate de visualização do mapa de sala — espelha a permissão `mapa:ver` do
 * back. Gate de UX na página; o 403 do BFF continua sendo a fonte da verdade.
 */ 
export function canViewRoomMap(user: CurrentUser | null | undefined): boolean {
  return can(user, 'mapa:ver')
}
