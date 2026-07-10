import type { AnnouncementFile } from '../types/file'

/** Preferência: `displayUrl` do back; fallback legado bucket+key. */
export function resolveAnnouncementFileUrl(file: AnnouncementFile): string | null {
  if (file.displayUrl) return file.displayUrl
  if (file.s3Bucket && file.s3Key) {
    return `https://${file.s3Bucket}.s3.amazonaws.com/${file.s3Key}`
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
