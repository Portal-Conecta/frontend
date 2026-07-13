import type { ListRoomMapsParams, RoomMapPageResponse, RoomMapView } from '../../types'

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
