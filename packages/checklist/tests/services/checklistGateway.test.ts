import { describe, expect, it } from 'vitest'

import { CHECKLIST_GATEWAY_PREFIX, checklistGatewayPath } from '../../src/services/checklistGateway'

describe('checklistGatewayPath', () => {
  it('prefixa um path que já começa com /', () => {
    expect(checklistGatewayPath('/api/checklist-executions')).toBe(
      '/checklist/api/checklist-executions',
    )
  })

  it('normaliza um path sem / inicial', () => {
    expect(checklistGatewayPath('api/checklist-executions')).toBe(
      '/checklist/api/checklist-executions',
    )
  })

  it('usa o prefixo exportado', () => {
    expect(CHECKLIST_GATEWAY_PREFIX).toBe('/checklist')
  })
})
