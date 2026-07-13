import type { ListRoomMapsParams, RoomMapPageResponse, RoomMapView } from '../../types'

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
