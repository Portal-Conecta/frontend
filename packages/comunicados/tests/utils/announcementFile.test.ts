import { describe, expect, it } from 'vitest'

import type { AnnouncementFile } from '../../src/types/file'
import { pickThumbnailUrl, resolveAnnouncementFileUrl } from '../../src/utils/announcementFile'

function makeFile(partial: Partial<AnnouncementFile> & Pick<AnnouncementFile, 'id'>): AnnouncementFile {
  return {
    announcementId: 'post-1',
    originalName: 'foto.jpg',
    s3Key: 'uploads/foto.jpg',
    s3Bucket: 'bucket',
    contentType: 'image/jpeg',
    type: 'IMAGE',
    sizeBytes: 10,
    isThumbnail: false,
    uploadedByUserId: 'u-1',
    createdAt: '2026-06-02T12:00:00.000Z',
    ...partial,
  }
}

describe('announcementFile utils', () => {
  it('prefere displayUrl ao montar URL do arquivo', () => {
    expect(
      resolveAnnouncementFileUrl(
        makeFile({ id: '1', displayUrl: 'https://cdn.example/signed.jpg' }),
      ),
    ).toBe('https://cdn.example/signed.jpg')
  })

  it('faz fallback para bucket+key quando não há displayUrl', () => {
    expect(resolveAnnouncementFileUrl(makeFile({ id: '1' }))).toBe(
      'https://bucket.s3.amazonaws.com/uploads/foto.jpg',
    )
  })

  it('escolhe a imagem marcada como thumbnail', () => {
    const files = [
      makeFile({ id: 'a', displayUrl: 'https://cdn.example/a.jpg' }),
      makeFile({ id: 'b', displayUrl: 'https://cdn.example/b.jpg', isThumbnail: true }),
    ]

    expect(pickThumbnailUrl(files)).toBe('https://cdn.example/b.jpg')
  })

  it('ignora imagens PENDING/FAILED', () => {
    const files = [
      makeFile({ id: 'pending', displayUrl: 'https://cdn.example/p.jpg', fileStatus: 'PENDING' }),
      makeFile({ id: 'ready', displayUrl: 'https://cdn.example/r.jpg', fileStatus: 'READY' }),
    ]

    expect(pickThumbnailUrl(files)).toBe('https://cdn.example/r.jpg')
  })
})
