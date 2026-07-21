import type { TypeUser } from '@portal/core'

/**
 * Variante reduzida do painel (origem + período + intervalo de datas): aluno e
 * representante — sem curso/turma/turno na UI; a autorização real continua no
 * BFF/backend.
 */
export function usesReducedMuralFilters(userType?: TypeUser): boolean {
  return userType === 'STUDENT' || userType === 'REPRESENTATIVE'
}
