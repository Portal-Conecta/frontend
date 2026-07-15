import type { LayoutTemplateWithPositions } from '../../types'

import { createHttpClient } from '@portal/core/http/httpClient'
import { mapaSalaGatewayPath } from '../mapaSalaGateway'

const http = createHttpClient('API_GATEWAY_URL')

/**
 * Serviço de layouts de sala no server. Fala direto com o back de mapa de sala
 * pelo http client compartilhado, que lê o JWT do cookie de sessão — então só
 * roda em Server Components e Route Handlers, nunca no browser.
 */

/**
 * Carrega o layout da sala (`GET /api/layouts/salas/{salaId}`) — template e
 * posições disponíveis para o professor montar o mapa da turma.
 */
export async function getRoomLayout(salaId: string): Promise<LayoutTemplateWithPositions> {
  return http.get<LayoutTemplateWithPositions>(
    mapaSalaGatewayPath(`/api/layouts/salas/${salaId}`),
  )
}
