import { act, renderHook } from '@testing-library/react'
import { JSDOM } from 'jsdom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as postsClient from '../../src/services/client'
import { useEditAnnouncement } from '../../src/hooks/useEditAnnouncement'

vi.mock('../../src/services/client', () => ({
  loadAnnouncementClient: vi.fn(),
  updateAnnouncementClient: vi.fn(),
  rescheduleAnnouncementClient: vi.fn(),
}))

const mockedClient = vi.mocked(postsClient)

const dom = new JSDOM('<!doctype html><html><body></body></html>')

beforeEach(() => {
  vi.stubGlobal('window', dom.window as unknown as Window & typeof globalThis)
  vi.stubGlobal('document', dom.window.document)
  vi.stubGlobal('navigator', dom.window.navigator)
})

describe('useEditAnnouncement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carrega, atualiza e reagenda um comunicado', async () => {
    const detail = {
      announcement: { id: '1', title: 'Olá', description: '', origin: 'WEG', status: 'SCHEDULED', pinned: false, pinnedOrder: null, createdByUserId: 'u1', publishedByUserId: null, scheduledFor: null, publishedAt: null, removedAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      destinations: [],
      files: [],
      tags: [],
      mentions: [],
    }

    mockedClient.loadAnnouncementClient.mockResolvedValue(detail)
    mockedClient.updateAnnouncementClient.mockResolvedValue(detail)
    mockedClient.rescheduleAnnouncementClient.mockResolvedValue(detail)

    const { result } = renderHook(() => useEditAnnouncement())

    await act(async () => {
      await result.current.load('1')
    })

    expect(result.current.detail).toEqual(detail)

    await act(async () => {
      await result.current.save({ title: 'Novo' })
    })

    await act(async () => {
      await result.current.reschedule('2026-07-10T10:00:00.000Z')
    })

    expect(mockedClient.loadAnnouncementClient).toHaveBeenCalledWith('1')
    expect(mockedClient.updateAnnouncementClient).toHaveBeenCalledWith('1', { title: 'Novo' })
    expect(mockedClient.rescheduleAnnouncementClient).toHaveBeenCalledWith('1', '2026-07-10T10:00:00.000Z')
  })
})
