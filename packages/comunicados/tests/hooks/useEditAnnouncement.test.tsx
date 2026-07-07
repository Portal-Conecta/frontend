// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as postsClient from '../../src/services/client'
import { useEditAnnouncement } from '../../src/hooks/useEditAnnouncement'

vi.mock('../../src/services/client', () => ({
  loadAnnouncementClient: vi.fn(),
  updateAnnouncementClient: vi.fn(),
  rescheduleAnnouncementClient: vi.fn(),
}))

const mockedClient = vi.mocked(postsClient)

describe('useEditAnnouncement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('expõe load, save e reschedule como funções', () => {
    const { announcementId, detail, loading, saving, error, load, save, reschedule } =
      useEditAnnouncement()

    expect(announcementId).toBeNull()
    expect(detail).toBeNull()
    expect(loading).toBe(false)
    expect(saving).toBe(false)
    expect(error).toBeNull()
    expect(typeof load).toBe('function')
    expect(typeof save).toBe('function')
    expect(typeof reschedule).toBe('function')
  })
})