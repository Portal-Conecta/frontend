import type { AnnouncementFile } from '../types/file'

/**
 * O bucket `*-raw-*` / path `/raw/` é privado (upload). Exibição usa processed.
 * Se o back ainda devolver URL raw em `displayUrl`, reescreve para processed.
 */
export function toProcessedDisplayUrl(url: string): string {
  return url.replace(/comunicados-raw-sa/gi, 'comunicados-processed-sa').replace(/\/raw\//g, '/processed/')
}

function isRawUrl(url: string): boolean {
  return /comunicados-raw-sa/i.test(url) || /\/raw\//.test(url)
}

function processedBucketFromRaw(bucket: string): string {
  if (/raw/i.test(bucket)) {
    return bucket.replace(/raw/gi, 'processed')
  }
  return bucket
}

/**
 * URL de exibição de um arquivo.
 * Preferência: `displayUrl` (já processed) → `processedS3Key` → nunca o raw.
 */
export function resolveAnnouncementFileUrl(file: AnnouncementFile): string | null {
  if (file.displayUrl) {
    return isRawUrl(file.displayUrl) ? toProcessedDisplayUrl(file.displayUrl) : file.displayUrl
  }

  if (file.processedS3Key) {
    const bucket = processedBucketFromRaw(file.s3Bucket || 'comunicados-processed-sa')
    return `https://${bucket}.s3.amazonaws.com/${file.processedS3Key}`
  }

  return null
}

function isUsableImage(file: AnnouncementFile): boolean {
  if (file.type !== 'IMAGE') return false
  if (file.fileStatus === 'FAILED' || file.fileStatus === 'PENDING') return false
  return Boolean(resolveAnnouncementFileUrl(file))
}

/** Miniatura do mural: `isThumbnail`, senão a primeira imagem utilizável. */
export function pickThumbnailUrl(files: readonly AnnouncementFile[]): string | null {
  const images = files.filter(isUsableImage)
  const thumbnail = images.find((file) => file.isThumbnail) ?? images[0]
  return thumbnail ? resolveAnnouncementFileUrl(thumbnail) : null
}

/** Imagens exibíveis, thumbnail primeiro. */
export function getAnnouncementImages(files: readonly AnnouncementFile[]): AnnouncementFile[] {
  const images = files.filter(isUsableImage)
  return [...images].sort((a, b) => Number(b.isThumbnail) - Number(a.isThumbnail))
}

export function getAnnouncementDocuments(files: readonly AnnouncementFile[]): AnnouncementFile[] {
  return files.filter((file) => file.type !== 'IMAGE')
}
