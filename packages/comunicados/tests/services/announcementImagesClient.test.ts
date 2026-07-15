import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FileUploadItem } from '@portal/ui'

import {
  deleteAnnouncementImageClient,
  uploadAnnouncementImagesClient,
} from '../../src/services/client/announcementImagesClient'

function response(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function stubFetch() {
  const mock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', mock)
  return mock
}

function imageItem(id: string, name: string): FileUploadItem & { file: File } {
  return {
    id,
    name,
    previewUrl: `blob:${id}`,
    file: new File(['x'], name, { type: 'image/png' }),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('uploadAnnouncementImagesClient', () => {
  it('envia multipart ao BFF; primeira imagem com thumbnail', async () => {
    const fetchMock = stubFetch()
    fetchMock
      .mockResolvedValueOnce(response(201, { fileId: 'f1' }))
      .mockResolvedValueOnce(response(201, { fileId: 'f2' }))

    const images = [imageItem('1', 'a.png'), imageItem('2', 'b.png')]
    const result = await uploadAnnouncementImagesClient('post-1', images)

    expect(result).toEqual([{ fileId: 'f1' }, { fileId: 'f2' }])
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const [firstUrl, firstInit] = fetchMock.mock.calls[0]!
    const [secondUrl] = fetchMock.mock.calls[1]!

    expect(firstUrl).toBe('/api/comunicados/posts/post-1/images?thumbnail=true')
    expect(firstInit?.body).toBeInstanceOf(FormData)
    expect(secondUrl).toBe('/api/comunicados/posts/post-1/images')
  })

  it('ignora itens sem arquivo local', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, { fileId: 'f1' }))

    await uploadAnnouncementImagesClient('post-1', [
      imageItem('1', 'a.png'),
      { id: '2', previewUrl: 'https://cdn/x.png' },
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('no retry parcial só envia ids ainda não sincronizados', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, { fileId: 'f2' }))
    const onUploaded = vi.fn()

    await uploadAnnouncementImagesClient(
      'post-1',
      [imageItem('1', 'a.png'), imageItem('2', 'b.png')],
      {
        alreadyUploadedLocalIds: new Set(['1']),
        markFirstAsThumbnail: false,
        onUploaded,
      },
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/comunicados/posts/post-1/images')
    expect(onUploaded).toHaveBeenCalledWith('2', { fileId: 'f2' })
  })
})

describe('deleteAnnouncementImageClient', () => {
  it('204 → deleted', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(204))
    await expect(deleteAnnouncementImageClient('p', 'img')).resolves.toBe('deleted')
  })

  it('404 → missing (no-op)', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(404, { code: 'not_found' }))
    await expect(deleteAnnouncementImageClient('p', 'img')).resolves.toBe('missing')
  })
})
