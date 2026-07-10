import type { UnassignedStudent } from './student'

/**
 * DÍVIDA DE CONTRATO: `RoomMapGrid`/`RoomMapAllocation` são provisórios. O
 * `mapa-sala-backend` não está disponível neste ambiente para confirmar os
 * campos exatos contra o Swagger — confirmar com o Tech Lead de Mapa de Sala
 * antes de consumir em produção (ver tabela de dívidas técnicas no AGENTS.md).
 */
export interface RoomMapGrid {
  rows: number
  columns: number
}

/** Vínculo de um aluno a um assento do grid. Provisório — ver nota acima. */
export interface RoomMapAllocation {
  seatId: string
  studentId: string
}

/** Mapa salvo de uma sala/turma: grid de assentos + alocações. */
export interface RoomMap {
  grid: RoomMapGrid
  allocations: RoomMapAllocation[]
}

interface RoomMapViewBase {
  unassignedStudent: UnassignedStudent[]
}

/** Turma sem mapa salvo — back não retorna `map`; a tela sugere alfabeticamente. */
export interface RoomMapViewSuggested extends RoomMapViewBase {
  suggested: true
}

/** Turma com mapa salvo — back retorna `map` preenchido. */
export interface RoomMapViewSaved extends RoomMapViewBase {
  suggested: false
  map: RoomMap
}

/**
 * Resposta de `GET /api/mapas/salas/{salaId}/turmas/{turmaId}`. União
 * discriminada em `suggested`: só o branch `false` tem `map`, refletindo o
 * contrato do back ("suggested=true vem sem map").
 */
export type RoomMapViewResponse = RoomMapViewSuggested | RoomMapViewSaved

/**
 * Item da listagem paginada de mapas. Campos alinhados ao path
 * `salas/{salaId}/turmas/{turmaId}` usado no restante da API — os demais
 * campos (nome da sala, atualizado em, etc.) são dívida de contrato, ver nota
 * de `RoomMapGrid` acima.
 */
export interface RoomMapSummary {
  id: string
  salaId: string
  turmaId: string
}

/** Paginação de `GET /api/mapas`. */
export interface ListRoomMapsResponse {
  items: RoomMapSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** Query de `GET /api/mapas` — `page` é zero-based no back. */
export interface ListRoomMapsParams {
  page?: number
  size?: number
}
