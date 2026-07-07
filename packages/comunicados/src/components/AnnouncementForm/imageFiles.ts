/** Motivo de rejeição ao processar arquivos no `ImageUploader`. */
export type ImageRejectionReason = 'not-image' | 'limit-exceeded'

export interface ImageFileRejection {
  file: File
  reason: ImageRejectionReason
}

export interface ProcessImageFilesResult {
  accepted: File[]
  rejected: ImageFileRejection[]
}

/**
 * Filtra e limita arquivos para o uploader.
 *
 * - Rejeita o que não for `image/*`.
 * - Aceita no máximo `remaining` imagens; o excedente vai para `limit-exceeded`.
 */
export function processImageFiles(
  files: FileList | readonly File[] | null,
  remaining: number,
): ProcessImageFilesResult {
  if (!files || files.length === 0 || remaining <= 0) {
    return { accepted: [], rejected: [] }
  }

  const accepted: File[] = []
  const rejected: ImageFileRejection[] = []

  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) {
      rejected.push({ file, reason: 'not-image' })
      continue
    }
    if (accepted.length >= remaining) {
      rejected.push({ file, reason: 'limit-exceeded' })
      continue
    }
    accepted.push(file)
  }

  return { accepted, rejected }
}

/** Mensagem amigável quando há rejeições (ex.: arrastar 8 fotos com limite 5). */
export function formatRejectionMessage(
  rejections: readonly ImageFileRejection[],
  maxImages: number,
): string | null {
  if (rejections.length === 0) return null

  const notImage = rejections.filter((item) => item.reason === 'not-image').length
  const limitExceeded = rejections.filter((item) => item.reason === 'limit-exceeded').length
  const parts: string[] = []

  if (notImage > 0) {
    parts.push(
      notImage === 1 ? '1 arquivo não é uma imagem' : `${notImage} arquivos não são imagens`,
    )
  }
  if (limitExceeded > 0) {
    parts.push(
      limitExceeded === 1
        ? `1 arquivo excedeu o limite de ${maxImages} imagens`
        : `${limitExceeded} arquivos excederam o limite de ${maxImages} imagens`,
    )
  }

  return `${parts.join('. ')}.`
}
