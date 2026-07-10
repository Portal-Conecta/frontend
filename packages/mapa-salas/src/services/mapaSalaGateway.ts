/**
 * Rotas do módulo Mapa de Sala via API Gateway.
 *
 * O gateway publica `/mapa/**`, remove o prefixo e encaminha ao serviço
 * (ex.: `/mapa/api/mapas` → `/api/mapas`).
 *
 * @see api-gateway/README.md — mapa de rotas
 */

/** Prefixo externo do módulo no gateway. */
export const MAPA_SALA_GATEWAY_PREFIX = '/mapa'

const API_GATEWAY_URL_ENV = 'API_GATEWAY_URL'

export function resolveApiGatewayUrl(): string {
  const url = process.env[API_GATEWAY_URL_ENV]
  if (!url) {
    throw new Error(`${API_GATEWAY_URL_ENV} não configurada`)
  }
  return url.replace(/\/$/, '')
}

/** Path público no gateway a partir do caminho interno do serviço de mapa de sala. */
export function mapaSalaGatewayPath(servicePath: string): string {
  const normalized = servicePath.startsWith('/') ? servicePath : `/${servicePath}`
  return `${MAPA_SALA_GATEWAY_PREFIX}${normalized}`
}
