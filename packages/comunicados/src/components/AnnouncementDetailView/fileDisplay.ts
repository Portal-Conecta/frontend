import type { AnnouncementFile } from '../../types/file'

/**
 * Helpers de exibição de arquivo — colocalizados com os client islands do detalhe.
 * Não importar `utils/announcementFile` a partir de componentes no App Router:
 * o Webpack do Next 15 chega a entregar named exports como `undefined` nesse grafo.
 */

export function toProcessedDisplayUrl(url: string): string {
  return url
    .replace(/comunicados-raw-sa/gi, 'comunicados-processed-sa')
    .replace(/\/raw\//g, '/processed/')
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

/** URL de exibição: `displayUrl` processed → `processedS3Key` → nunca raw. */
export function resolveFileDisplayUrl(file: AnnouncementFile): string | null {
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
  return Boolean(resolveFileDisplayUrl(file))
}

/** Imagens exibíveis, thumbnail primeiro. */
export function listDisplayImages(files: readonly AnnouncementFile[]): AnnouncementFile[] {
  return [...files.filter(isUsableImage)].sort(
    (a, b) => Number(b.isThumbnail) - Number(a.isThumbnail),
  )
}

export function listDisplayDocuments(files: readonly AnnouncementFile[]): AnnouncementFile[] {
  return files.filter((file) => file.type !== 'IMAGE')
}
