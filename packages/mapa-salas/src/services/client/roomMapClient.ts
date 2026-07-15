import type {
  ListRoomMapsParams,
  MoveStudentRequest,
  RoomMapPageResponse,
  RoomMapView,
  UpdateRoomMapAllocationsRequest,
} from '../../types'

import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

/**
 * Serviço de mapas de sala no browser. Toda chamada vai ao BFF de mesma origem
 * (`/api/mapa-salas/...`); o JWT nunca sai do server.
 */

/** Lista os mapas salvos via BFF (`GET /api/mapa-salas/mapas`). */
export async function listRoomMapsClient(
  params: ListRoomMapsParams = {},
): Promise<RoomMapPageResponse> {
  return bffFetch<RoomMapPageResponse>(
    `/api/mapa-salas/mapas${buildQuery(params as QueryParams)}`,
  )
}

/**
 * Carrega a visualização do mapa da turma via BFF
 * (`GET /api/mapa-salas/mapas/salas/{salaId}/turmas/{turmaId}`).
 */
export async function getRoomMapViewClient(
  salaId: string,
  turmaId: string,
): Promise<RoomMapView> {
  return bffFetch<RoomMapView>(`/api/mapa-salas/mapas/salas/${salaId}/turmas/${turmaId}`)
}

/**
 * Salva as alocações via BFF (`PUT /api/mapa-salas/mapas/{id}/allocations`).
 * Retorna o view atualizado.
 */
export async function updateAllocationsClient(
  id: string,
  request: UpdateRoomMapAllocationsRequest,
): Promise<RoomMapView> {
  return bffFetch<RoomMapView>(`/api/mapa-salas/mapas/${id}/allocations`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

/**
 * Move um aluno de assento via BFF (`PATCH /api/mapa-salas/mapas/{id}/locations/move`).
 * 204 sem corpo.
 */
export async function moveStudentClient(id: string, request: MoveStudentRequest): Promise<void> {
  await bffFetch<void>(`/api/mapa-salas/mapas/${id}/locations/move`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

/**
 * Arquiva o mapa via BFF (`PATCH /api/mapa-salas/mapas/{id}/arquivar`).
 * 204 sem corpo.
 */
export async function archiveRoomMapClient(id: string): Promise<void> {
  await bffFetch<void>(`/api/mapa-salas/mapas/${id}/arquivar`, { method: 'PATCH' })
}