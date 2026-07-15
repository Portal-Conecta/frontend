import type { FileUploadItem } from '@portal/ui'

import type { PresignedImageUploadResult } from '../../types/presign'

export class AnnouncementImagesClientError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message?: string,
  ) {
    super(message ?? code)
    this.name = 'AnnouncementImagesClientError'
  }
}

export interface UploadAnnouncementImageOptions {
  thumbnail?: boolean
}

export interface UploadAnnouncementImagesOptions {
  /**
   * Quando true (default), a primeira imagem nova vira thumbnail.
   * Na edição, desligar se ainda restarem imagens remotas.
   */
  markFirstAsThumbnail?: boolean
}

async function parseError(res: Response): Promise<AnnouncementImagesClientError> {
  const data = (await res.json().catch(() => null)) as { code?: string; message?: string } | null
  return new AnnouncementImagesClientError(
    data?.code ?? 'server',
    res.status,
    data?.message,
  )
}

/**
 * Envia imagem ao BFF, que presigna via API Gateway e faz PUT ao S3 no servidor.
 * A primeira imagem deve usar `thumbnail: true`.
 */
export async function uploadAnnouncementImageClient(
  postId: string,
  file: File,
  options: UploadAnnouncementImageOptions = {},
): Promise<PresignedImageUploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const qs = options.thumbnail ? '?thumbnail=true' : ''
  const res = await fetch(`/api/comunicados/posts/${postId}/images${qs}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return (await res.json()) as PresignedImageUploadResult
}

/** Remove imagem via BFF (`DELETE /api/comunicados/posts/{id}/images/{imageId}`). */
export async function deleteAnnouncementImageClient(
  postId: string,
  imageId: string,
): Promise<void> {
  const res = await fetch(`/api/comunicados/posts/${postId}/images/${imageId}`, {
    method: 'DELETE',
    cache: 'no-store',
  })

  if (res.status === 204) return
  if (!res.ok) {
    throw await parseError(res)
  }
}

/** Envia em sequência as imagens locais do wizard (#198). */
export async function uploadAnnouncementImagesClient(
  postId: string,
  images: readonly FileUploadItem[],
  options: UploadAnnouncementImagesOptions = {},
): Promise<PresignedImageUploadResult[]> {
  const markFirstAsThumbnail = options.markFirstAsThumbnail ?? true
  const pending = images.filter((item): item is FileUploadItem & { file: File } => Boolean(item.file))
  const uploaded: PresignedImageUploadResult[] = []

  for (let index = 0; index < pending.length; index++) {
    const item = pending[index]!
    const result = await uploadAnnouncementImageClient(postId, item.file, {
      thumbnail: markFirstAsThumbnail && index === 0,
    })
    uploaded.push(result)
  }

  return uploaded
}
