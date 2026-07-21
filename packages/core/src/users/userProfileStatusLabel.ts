/**
 * Rótulos de status na visão admin do perfil (#443).
 * Reusa a semântica Ativo/Inativo do boolean `UserById.active`.
 */
export function userProfileStatusLabel(active: boolean): string {
  return active ? 'Ativo' : 'Inativo'
}
