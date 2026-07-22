import { describe, expect, it } from 'vitest'

import { useMuralFilterCatalog } from '../../src/hooks/useMuralFilterCatalog'
import {
  listDestinationClassesClient,
  listDestinationCoursesClient,
} from '../../src/services/client/destinationsClient'
import { listTagsClient } from '../../src/services/client/tagsClient'

/**
 * Suíte de testes de hook roda em ambiente `node` (sem jsdom/Testing Library —
 * ver vitest.config.ts), então cobrimos o contrato: o hook aceita `seed` opcional
 * (#406, prefetch do `PageMural`) sem quebrar a assinatura usada sem argumento
 * por `PageMeusComunicadosContent`, e ainda depende dos clients já testados em
 * destinationsClient.test.ts/tagsClient.test.ts pro caso sem seed.
 */
describe('useMuralFilterCatalog — contrato', () => {
  it('exporta o hook aceitando seed opcional e usa os clients já testados no fallback sem seed', () => {
    expect(typeof useMuralFilterCatalog).toBe('function')
    expect(useMuralFilterCatalog.length).toBe(1)
    expect(typeof listDestinationCoursesClient).toBe('function')
    expect(typeof listDestinationClassesClient).toBe('function')
    expect(typeof listTagsClient).toBe('function')
  })
})
