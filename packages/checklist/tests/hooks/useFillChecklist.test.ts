import { describe, expect, it } from 'vitest'

import { useFillChecklist } from '../../src/hooks/useFillChecklist'
import {
  createDraftClient,
  findExecutionByIdClient,
  saveDraftAnswersClient,
  submitExecutionClient,
} from '../../src/services/client/executionClient'

/**
 * Suíte de testes de hook roda em ambiente `node` (sem jsdom/Testing Library —
 * ver vitest.config.ts), então cobrimos o contrato: o hook existe e usa os
 * clients já testados (params/URL/erros em executionClient.test.ts).
 */
describe('useFillChecklist — contrato', () => {
  it('exporta o hook e usa os clients de execução', () => {
    expect(typeof useFillChecklist).toBe('function')
    expect(typeof createDraftClient).toBe('function')
    expect(typeof findExecutionByIdClient).toBe('function')
    expect(typeof saveDraftAnswersClient).toBe('function')
    expect(typeof submitExecutionClient).toBe('function')
  })
})
