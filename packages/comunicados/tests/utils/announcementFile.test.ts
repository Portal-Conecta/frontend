import { describe, expect, it } from 'vitest'

import type { AnnouncementFile } from '../../src/types/file'
import {
  getAnnouncementDocuments,
  getAnnouncementImages,
  resolveAnnouncementFileUrl,
  toProcessedDisplayUrl,
} from '../../src/utils/announcementFile'

function makeFile(partial: Partial<AnnouncementFile> & Pick<AnnouncementFile, 'id'>): AnnouncementFile {
  return {
    announcementId: 'post-1',
    originalName: 'foto.jpg',
    s3Key: 'comunicados/post/raw/foto.jpg',
    s3Bucket: 'comunicados-raw-sa',
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
  it('reescreve URL raw para processed', () => {
    expect(
      toProcessedDisplayUrl(
        'https://comunicados-raw-sa.s3.amazonaws.com/comunicados/a/raw/b.png',
      ),
    ).toBe('https://comunicados-processed-sa.s3.amazonaws.com/comunicados/a/processed/b.png')
  })

  it('converte displayUrl raw ao resolver', () => {
    expect(
      resolveAnnouncementFileUrl(
        makeFile({
          id: '1',
          displayUrl: 'https://comunicados-raw-sa.s3.amazonaws.com/comunicados/a/raw/b.png',
        }),
      ),
    ).toBe('https://comunicados-processed-sa.s3.amazonaws.com/comunicados/a/processed/b.png')
  })

  it('usa processedS3Key quando não há displayUrl', () => {
    expect(
      resolveAnnouncementFileUrl(
        makeFile({
          id: '1',
          processedS3Key: 'comunicados/a/processed/b.png',
        }),
      ),
    ).toBe('https://comunicados-processed-sa.s3.amazonaws.com/comunicados/a/processed/b.png')
  })

  it('não cai no raw quando não há processed', () => {
    expect(resolveAnnouncementFileUrl(makeFile({ id: '1' }))).toBeNull()
  })

  it('separa imagens e documentos', () => {
    const files = [
      makeFile({
        id: 'img',
        displayUrl: 'https://comunicados-processed-sa.s3.amazonaws.com/x.jpg',
        isThumbnail: true,
        fileStatus: 'READY',
      }),
      makeFile({
        id: 'doc',
        type: 'DOCUMENT',
        originalName: 'a.pdf',
        displayUrl: 'https://example.com/a.pdf',
      }),
    ]

    expect(getAnnouncementImages(files).map((f) => f.id)).toEqual(['img'])
    expect(getAnnouncementDocuments(files).map((f) => f.id)).toEqual(['doc'])
  })
})
