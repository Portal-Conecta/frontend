import type {
  CreateRoomMapRequest,
  LayoutTemplateWithPositions,
  ListRoomMapsParams,
  RoomMapPageResponse,
  RoomMapView,
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
 * Cria o mapa de sala de uma turma via BFF (`POST /api/mapa-salas/mapas`),
 * retornando a view do mapa criado.
 */
export async function createRoomMapClient(request: CreateRoomMapRequest): Promise<RoomMapView> {
  return bffFetch<RoomMapView>('/api/mapa-salas/mapas', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Carrega o layout da sala (template + posições) via BFF
 * (`GET /api/mapa-salas/layouts/salas/{salaId}`).
 */
export async function getRoomLayoutClient(salaId: string): Promise<LayoutTemplateWithPositions> {
  return bffFetch<LayoutTemplateWithPositions>(`/api/mapa-salas/layouts/salas/${salaId}`)
}
