import { resolveApiGatewayUrl } from './comunicadosGateway'

/**
 * Rotas do Hub (core) via API Gateway.
 *
 * O gateway publica `/hub/**`, remove o prefixo e encaminha ao core
 * (ex.: `/hub/courses` → `/courses`).
 *
 * @see api-gateway/README.md — mapa de rotas
 */

export const HUB_GATEWAY_PREFIX = '/hub'

export { resolveApiGatewayUrl }

/** Path público no gateway a partir do caminho interno do Hub. */
export function hubGatewayPath(servicePath: string): string {
  const normalized = servicePath.startsWith('/') ? servicePath : `/${servicePath}`
  return `${HUB_GATEWAY_PREFIX}${normalized}`
}
