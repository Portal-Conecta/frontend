/**
 * Rotas do módulo Checklist via API Gateway.
 *
 * O gateway publica `/checklist/**`, remove o prefixo e encaminha ao serviço
 * (ex.: `/checklist/api/checklist-templates` → `/api/checklist-templates`).
 */
export const CHECKLIST_GATEWAY_PREFIX = '/checklist'

/** Path público no gateway a partir do caminho interno do serviço de checklist. */
export function checklistGatewayPath(servicePath: string): string {
  const normalized = servicePath.startsWith('/') ? servicePath : `/${servicePath}`
  return `${CHECKLIST_GATEWAY_PREFIX}${normalized}`
}
