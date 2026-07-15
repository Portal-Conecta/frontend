import type { FileUploadItem } from '@portal/ui'

import type { PresignedImageUploadResult } from '../types/presign'

/** IDs remotas que estavam no load e sumiram do FileUpload (remoção pelo usuário). */
export function resolveRemovedImageIds(
  initialImageIds: readonly string[],
  currentImages: readonly FileUploadItem[],
): string[] {
  const remainingRemote = new Set(
    currentImages.filter((item) => !item.file).map((item) => item.id),
  )
  return initialImageIds.filter((id) => !remainingRemote.has(id))
}

export function hasLocalImageFiles(images: readonly FileUploadItem[]): boolean {
  return images.some((item) => Boolean(item.file))
}

export function hasRemainingRemoteImages(images: readonly FileUploadItem[]): boolean {
  return images.some((item) => !item.file && Boolean(item.previewUrl))
}

/** Remove o `File` local após upload bem-sucedido (retry não reenvia). */
export function clearLocalFile(item: FileUploadItem): FileUploadItem {
  return {
    id: item.id,
    previewUrl: item.previewUrl,
    ...(item.name != null ? { name: item.name } : {}),
  }
}

/**
 * Após upload: troca o id local pelo `fileId` remoto e remove `file`.
 * Mantém `previewUrl` (blob) para a UI até o próximo reload.
 */
export function markLocalImageUploaded(
  images: readonly FileUploadItem[],
  localId: string,
  remoteFileId: string,
): FileUploadItem[] {
  return images.map((item) => {
    if (item.id !== localId) return item
    return {
      id: remoteFileId,
      previewUrl: item.previewUrl,
      ...(item.name != null ? { name: item.name } : {}),
    }
  })
}

export function pendingLocalImages(
  images: readonly FileUploadItem[],
  alreadyUploadedLocalIds: ReadonlySet<string> = new Set(),
): Array<FileUploadItem & { file: File }> {
  return images.filter(
    (item): item is FileUploadItem & { file: File } =>
      Boolean(item.file) && !alreadyUploadedLocalIds.has(item.id),
  )
}

export interface SyncAnnouncementImagesDeps {
  uploadOne: (
    postId: string,
    file: File,
    options: { thumbnail?: boolean },
  ) => Promise<PresignedImageUploadResult>
  /** `missing` = DELETE 404 (tratado como no-op). */
  deleteOne: (postId: string, imageId: string) => Promise<'deleted' | 'missing'>
  /** Após cada upload/delete OK — o wizard atualiza estado para retry idempotente. */
  onProgress?: (state: SyncAnnouncementImagesResult) => void
}

export interface SyncAnnouncementImagesInput {
  postId: string
  images: readonly FileUploadItem[]
  initialImageIds: readonly string[]
}

export interface SyncAnnouncementImagesResult {
  images: FileUploadItem[]
  initialImageIds: string[]
}

/**
 * Sync de imagens na edição (#398):
 * 1. Upload das locais primeiro (upload-first)
 * 2. Atualiza `initialImageIds` após cada upload
 * 3. Deletes por último; 404 = no-op
 * 4. Atualiza `initialImageIds` após cada delete
 *
 * Em falha parcial, o estado retornado até o ponto do sucesso permite retry
 * idempotente (não reenvia já sincronizadas / não apaga de novo o que sumiu).
 */
export async function syncAnnouncementImages(
  input: SyncAnnouncementImagesInput,
  deps: SyncAnnouncementImagesDeps,
): Promise<SyncAnnouncementImagesResult> {
  let images = [...input.images]
  let initialImageIds = [...input.initialImageIds]

  const pending = pendingLocalImages(images)
  const markFirstAsThumbnail = !hasRemainingRemoteImages(images)

  for (let index = 0; index < pending.length; index++) {
    const item = pending[index]!
    const result = await deps.uploadOne(input.postId, item.file, {
      thumbnail: markFirstAsThumbnail && index === 0,
    })
    images = markLocalImageUploaded(images, item.id, result.fileId)
    if (!initialImageIds.includes(result.fileId)) {
      initialImageIds = [...initialImageIds, result.fileId]
    }
    deps.onProgress?.({ images: [...images], initialImageIds: [...initialImageIds] })
  }

  const removedIds = resolveRemovedImageIds(initialImageIds, images)
  for (const imageId of removedIds) {
    await deps.deleteOne(input.postId, imageId)
    initialImageIds = initialImageIds.filter((id) => id !== imageId)
    deps.onProgress?.({ images: [...images], initialImageIds: [...initialImageIds] })
  }

  return { images, initialImageIds }
}
