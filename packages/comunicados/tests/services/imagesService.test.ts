import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ImagesError,
  presignPostImage,
  uploadPostImage,
  uploadPostImageViaPresign,
} from '../../src/services/imagesService'
import type { AnnouncementFile } from '../../src/types/file'
import type { PresignUploadResponse } from '../../src/types/presign'

const API_GATEWAY_URL = 'https://gateway.test'
const TOKEN = 'jwt-token'
const POST_ID = 'post-uuid-1'

function response(status: number, body: unknown): Response {
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

const presignBody = {
  contentType: 'image/png',
  originalName: 'foto.png',
  sizeBytes: 6,
  thumbnail: true,
}

const presignResponse: PresignUploadResponse = {
  fileId: 'file-1',
  uploadUrl: 'https://s3.amazonaws.com/bucket/key?signature=abc',
  fields: {},
}

const file = new File(['pixels'], 'foto.png', { type: 'image/png' })

beforeEach(() => {
  process.env.API_GATEWAY_URL = API_GATEWAY_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.API_GATEWAY_URL
})

describe('presignPostImage', () => {
  it('envia JSON com Bearer para /comunicados/api/posts/{id}/images/presign', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, presignResponse))

    await expect(presignPostImage(POST_ID, presignBody, TOKEN)).resolves.toEqual(presignResponse)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/${POST_ID}/images/presign`)
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('mapeia 400 para validation', async () => {
    stubFetch().mockResolvedValue(response(400, { message: 'ARQ02' }))
    await expect(presignPostImage(POST_ID, presignBody, TOKEN)).rejects.toBeInstanceOf(ImagesError)
  })
})

describe('uploadPostImage', () => {
  const announcementFile = {
    id: 'file-1',
    announcementId: POST_ID,
    originalName: 'foto.png',
    s3Key: 'key',
    s3Bucket: 'bucket',
    contentType: 'image/png',
    type: 'IMAGE',
    sizeBytes: 6,
    isThumbnail: true,
    uploadedByUserId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
  } satisfies AnnouncementFile

  it('faz POST multipart em /comunicados/api/posts/{id}/images sem duplicar a base URL', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, announcementFile))

    await expect(
      uploadPostImage(POST_ID, file, TOKEN, { thumbnail: true }),
    ).resolves.toEqual(announcementFile)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/${POST_ID}/images?thumbnail=true`)
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`)
    expect(init?.body).toBeInstanceOf(FormData)
  })

  it('omite a query quando thumbnail é false', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValue(response(201, { ...announcementFile, isThumbnail: false }))

    await uploadPostImage(POST_ID, file, TOKEN)

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API_GATEWAY_URL}/comunicados/api/posts/${POST_ID}/images`)
  })
})

describe('uploadPostImageViaPresign', () => {
  it('presign no gateway e PUT ao S3 no servidor', async () => {
    const fetchMock = stubFetch()
    fetchMock
      .mockResolvedValueOnce(response(201, presignResponse))
      .mockResolvedValueOnce(response(200, null))

    await expect(
      uploadPostImageViaPresign(POST_ID, file, TOKEN, { thumbnail: true }),
    ).resolves.toEqual({ fileId: 'file-1' })

    expect(fetchMock).toHaveBeenCalledTimes(2)

    const [presignUrl] = fetchMock.mock.calls[0]!
    const [putUrl, putInit] = fetchMock.mock.calls[1]!
    expect(presignUrl).toContain('/images/presign')
    expect(putUrl).toBe(presignResponse.uploadUrl)
    expect(putInit?.method).toBe('PUT')
    expect((putInit?.headers as Record<string, string>)['Content-Type']).toBe('image/png')
  })
})
