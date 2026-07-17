import { describe, expect, it, vi } from 'vitest'

import type { FileUploadItem } from '@portal/ui'

import {
  clearLocalFile,
  markLocalImageUploaded,
  pendingLocalImages,
  resolveRemovedImageIds,
  syncAnnouncementImages,
} from '../../src/utils/announcementImageSync'

function local(id: string, name: string): FileUploadItem & { file: File } {
  return {
    id,
    name,
    previewUrl: `blob:${id}`,
    file: new File(['x'], name, { type: 'image/png' }),
  }
}

function remote(id: string): FileUploadItem {
  return { id, previewUrl: `https://cdn/${id}.png`, name: `${id}.png` }
}

describe('resolveRemovedImageIds', () => {
  it('retorna ids iniciais ausentes do FileUpload remoto', () => {
    expect(resolveRemovedImageIds(['a', 'b', 'c'], [remote('a'), remote('c')])).toEqual(['b'])
  })
})

describe('pendingLocalImages', () => {
  it('ignora remotas e ids já enviados', () => {
    const images = [local('1', 'a.png'), remote('r1'), local('2', 'b.png')]
    expect(pendingLocalImages(images, new Set(['1'])).map((item) => item.id)).toEqual(['2'])
  })
})

describe('markLocalImageUploaded / clearLocalFile', () => {
  it('troca id local pelo fileId remoto e remove file', () => {
    const images = [local('1', 'a.png')]
    const next = markLocalImageUploaded(images, '1', 'remote-1')
    expect(next[0]).toEqual({
      id: 'remote-1',
      previewUrl: 'blob:1',
      name: 'a.png',
    })
    expect(clearLocalFile(local('1', 'a.png')).file).toBeUndefined()
  })
})

describe('syncAnnouncementImages', () => {
  it('faz upload-first, atualiza initialImageIds e delete-last', async () => {
    const uploadOne = vi
      .fn()
      .mockResolvedValueOnce({ fileId: 'new-1' })
    const deleteOne = vi.fn().mockResolvedValue('deleted' as const)

    const result = await syncAnnouncementImages(
      {
        postId: 'post-1',
        images: [remote('keep'), local('tmp', 'x.png')],
        initialImageIds: ['keep', 'gone'],
      },
      { uploadOne, deleteOne },
    )

    expect(uploadOne.mock.invocationCallOrder[0]!).toBeLessThan(deleteOne.mock.invocationCallOrder[0]!)
    expect(uploadOne).toHaveBeenCalledWith('post-1', expect.any(File), { thumbnail: false })
    expect(deleteOne).toHaveBeenCalledWith('post-1', 'gone')
    expect(result.initialImageIds).toEqual(['keep', 'new-1'])
    expect(result.images.map((item) => item.id)).toEqual(['keep', 'new-1'])
    expect(result.images.every((item) => !item.file)).toBe(true)
  })

  it('em falha parcial notifica progresso e não deleta (retry idempotente)', async () => {
    const uploadOne = vi
      .fn()
      .mockResolvedValueOnce({ fileId: 'new-1' })
      .mockRejectedValueOnce(new Error('fail'))
    const deleteOne = vi.fn()
    const onProgress = vi.fn()

    await expect(
      syncAnnouncementImages(
        {
          postId: 'post-1',
          images: [local('a', 'a.png'), local('b', 'b.png'), remote('keep')],
          initialImageIds: ['keep', 'stale'],
        },
        { uploadOne, deleteOne, onProgress },
      ),
    ).rejects.toThrow('fail')

    expect(deleteOne).not.toHaveBeenCalled()
    expect(onProgress).toHaveBeenCalledWith({
      images: [
        { id: 'new-1', previewUrl: 'blob:a', name: 'a.png' },
        expect.objectContaining({ id: 'b', file: expect.any(File) }),
        remote('keep'),
      ],
      initialImageIds: ['keep', 'stale', 'new-1'],
    })
  })

  it('trata DELETE 404 como no-op e remove o id de initialImageIds', async () => {
    const uploadOne = vi.fn()
    const deleteOne = vi.fn().mockResolvedValue('missing' as const)

    const result = await syncAnnouncementImages(
      {
        postId: 'post-1',
        images: [remote('keep')],
        initialImageIds: ['keep', 'already-gone'],
      },
      { uploadOne, deleteOne },
    )

    expect(deleteOne).toHaveBeenCalledWith('post-1', 'already-gone')
    expect(result.initialImageIds).toEqual(['keep'])
  })

  it('marca primeira local como thumbnail quando não há remotas', async () => {
    const uploadOne = vi.fn().mockResolvedValue({ fileId: 'n1' })
    const deleteOne = vi.fn()

    await syncAnnouncementImages(
      {
        postId: 'post-1',
        images: [local('a', 'a.png')],
        initialImageIds: [],
      },
      { uploadOne, deleteOne },
    )

    expect(uploadOne).toHaveBeenCalledWith('post-1', expect.any(File), { thumbnail: true })
  })
})
