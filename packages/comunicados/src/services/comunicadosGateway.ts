/**
 * Rotas do módulo Comunicados via API Gateway.
 *
 * O gateway publica `/comunicados/**`, remove o prefixo e encaminha ao serviço
 * (ex.: `/comunicados/api/posts/publish` → `/api/posts/publish`).
 *
 * @see api-gateway/README.md — mapa de rotas
 */

/** Prefixo externo do módulo no gateway. */
export const COMUNICADOS_GATEWAY_PREFIX = '/comunicados'

const API_GATEWAY_URL_ENV = 'API_GATEWAY_URL'

export function resolveApiGatewayUrl(): string {
  const url = process.env[API_GATEWAY_URL_ENV]
  if (!url) {
    throw new Error(`${API_GATEWAY_URL_ENV} não configurada`)
  }
  return url.replace(/\/$/, '')
}

/** Path público no gateway a partir do caminho interno do serviço de comunicados. */
export function comunicadosGatewayPath(servicePath: string): string {
  const normalized = servicePath.startsWith('/') ? servicePath : `/${servicePath}`
  return `${COMUNICADOS_GATEWAY_PREFIX}${normalized}`
}
