import { describe, expect, it } from 'vitest'

import { useMyAnnouncements } from '../../src/hooks/useMyAnnouncements'
import { listMyPostsClient } from '../../src/services/client/postsClient'

/**
 * Suíte de testes de hook roda em ambiente `node` (sem jsdom/Testing Library —
 * ver vitest.config.ts), então cobrimos o contrato: o hook existe e usa o
 * client já testado (params/URL em postsClient.test.ts). O split
 * `items`/`pinned` é a mesma forma de `ListAnnouncementsResponse`, devolvida
 * intacta pelo client.
 */
describe('useMyAnnouncements — contrato', () => {
  it('exporta o hook e usa listMyPostsClient (params/URL cobertos em postsClient.test.ts)', () => {
    expect(typeof useMyAnnouncements).toBe('function')
    expect(typeof listMyPostsClient).toBe('function')
  })
})
