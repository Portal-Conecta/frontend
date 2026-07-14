import type {
  ListRoomMapsParams,
  MoveStudentRequest,
  RoomMapPageResponse,
  RoomMapView,
  UpdateRoomMapAllocationsRequest,
} from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import type { QueryParams } from '@portal/core/http/query'
import { mapaSalaGatewayPath } from '../mapaSalaGateway'

const http = createHttpClient('API_GATEWAY_URL')

/**
 * Serviço de mapas de sala no server. Fala direto com o back de mapa de sala
 * pelo http client compartilhado, que lê o JWT do cookie de sessão — então só
 * roda em Server Components e Route Handlers, nunca no browser.
 */

/** Lista os mapas de sala salvos (`GET /api/mapas`), paginado. */
export async function listRoomMaps(
  params: ListRoomMapsParams | QueryParams = {},
): Promise<RoomMapPageResponse> {
  return http.get<RoomMapPageResponse>(mapaSalaGatewayPath('/api/mapas'), {
    params: params as QueryParams,
  })
}

/**
 * Carrega a visualização do mapa de uma turma
 * (`GET /api/mapas/salas/{salaId}/turmas/{turmaId}`). Turma sem mapa salvo
 * volta como sugestão alfabética (`suggested: true`, `map: null`); com mapa
 * salvo, `suggested: false` e `map` preenchido.
 */
export async function getRoomMapView(salaId: string, turmaId: string): Promise<RoomMapView> {
  return http.get<RoomMapView>(
    mapaSalaGatewayPath(`/api/mapas/salas/${salaId}/turmas/${turmaId}`),
  )
}

/**
 * Salva o conjunto de alocações de um mapa existente
 * (`PUT /api/mapas/{id}/allocations`). O back rejeita lista vazia
 * (`@NotEmpty`) — "limpar mapa" não é suportado por este endpoint
 * (ver #296, seção "O que NÃO fazer"). Substitui atomicamente todo o
 * conjunto de alocações e retorna o view atualizado (200).
 */
export async function updateAllocations(
  id: string,
  request: UpdateRoomMapAllocationsRequest,
): Promise<RoomMapView> {
  return http.put<RoomMapView>(mapaSalaGatewayPath(`/api/mapas/${id}/allocations`), {
    body: request,
  })
}

/**
 * Move um aluno para outra posição (`PATCH /api/mapas/{id}/locations/move`).
 * 204 sem corpo. `onConflict` resolve colisão de assento — padrão do back é
 * `DISPLACE` quando omitido.
 */
export async function moveStudent(id: string, request: MoveStudentRequest): Promise<void> {
  await http.patch<void>(mapaSalaGatewayPath(`/api/mapas/${id}/locations/move`), {
    body: request,
  })
}

/**
 * Arquiva o mapa (`PATCH /api/mapas/{id}/arquivar`). Soft delete — 204 sem
 * corpo. Professor só pode arquivar mapas da própria turma; ADMIN, qualquer.
 */
export async function archiveRoomMap(id: string): Promise<void> {
  await http.patch<void>(mapaSalaGatewayPath(`/api/mapas/${id}/arquivar`))
}