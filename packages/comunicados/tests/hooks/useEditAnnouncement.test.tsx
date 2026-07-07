// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as postsClient from '../../src/services/client'

vi.mock('../../src/services/client', () => ({
  loadAnnouncementClient: vi.fn(),
  updateAnnouncementClient: vi.fn(),
  rescheduleAnnouncementClient: vi.fn(),
}))

describe('useEditAnnouncement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('módulo de serviços exporta as funções esperadas', () => {
    expect(typeof postsClient.loadAnnouncementClient).toBe('function')
    expect(typeof postsClient.updateAnnouncementClient).toBe('function')
    expect(typeof postsClient.rescheduleAnnouncementClient).toBe('function')
  })
})