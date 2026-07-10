import { describe, expect, it } from 'vitest'

import {
  loadAnnouncementClient,
  rescheduleAnnouncementClient,
  updateAnnouncementClient,
} from '../../src/services/client/postsClient'

describe('useEditAnnouncement — contratos do client', () => {
  it('exporta as funções usadas pelo hook de edição', () => {
    expect(typeof loadAnnouncementClient).toBe('function')
    expect(typeof updateAnnouncementClient).toBe('function')
    expect(typeof rescheduleAnnouncementClient).toBe('function')
  })
})
