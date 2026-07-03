import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffFetch } from '@portal/core/http/bffClient'
import { loadAnnouncementClient, rescheduleAnnouncementClient, updateAnnouncementClient } from '../../src/services/client/postsClient'

vi.mock('@portal/core/http/bffClient', () => ({
  bffFetch: vi.fn(),
}))

const mockedBffFetch = vi.mocked(bffFetch)

describe('postsClient edit flows', () => {
  beforeEach(() => {
    mockedBffFetch.mockReset()
  })

  it('carrega detalhe do comunicado via BFF', async () => {
    const detail = { announcement: { id: '1', title: 'Olá' } }
    mockedBffFetch.mockResolvedValue(detail)

    await expect(loadAnnouncementClient('1')).resolves.toEqual(detail)
    expect(mockedBffFetch).toHaveBeenCalledWith('/api/comunicados/posts/1')
  })

  it('envia update parcial sem destinations', async () => {
    const detail = { announcement: { id: '1', title: 'Novo título' } }
    mockedBffFetch.mockResolvedValue(detail)

    await updateAnnouncementClient('1', {
      title: 'Novo título',
      destinations: [{ id: 'd1', announcementId: '1', type: 'GENERAL', referenceId: null }],
    })

    expect(mockedBffFetch).toHaveBeenCalledWith('/api/comunicados/posts/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Novo título' }),
    })
  })

  it('reagenda comunicado via route específica', async () => {
    const detail = { announcement: { id: '1', status: 'SCHEDULED' } }
    mockedBffFetch.mockResolvedValue(detail)

    await rescheduleAnnouncementClient('1', '2026-07-10T10:00:00.000Z')

    expect(mockedBffFetch).toHaveBeenCalledWith('/api/comunicados/posts/1/schedule', {
      method: 'PATCH',
      body: JSON.stringify({ scheduledFor: '2026-07-10T10:00:00.000Z' }),
    })
  })
})
