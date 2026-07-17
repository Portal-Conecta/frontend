import {
  ANNOUNCEMENT_IMAGE_MAX_BYTES,
  ANNOUNCEMENT_IMAGE_MIME_ALLOWLIST,
} from '../constants/announcementImageLimits'

export type AnnouncementImageValidationError =
  | { code: 'empty'; message: string }
  | { code: 'mime'; message: string }
  | { code: 'size'; message: string }

const ALLOWLIST = new Set<string>(ANNOUNCEMENT_IMAGE_MIME_ALLOWLIST)

export function isAllowedAnnouncementImageMime(contentType: string): boolean {
  return ALLOWLIST.has(contentType.trim().toLowerCase())
}

/**
 * Validação compartilhada BFF/client: MIME allowlist + teto de tamanho.
 * Retorna `null` quando o arquivo é aceitável.
 */
export function validateAnnouncementImageFile(
  file: Pick<File, 'size' | 'type'>,
): AnnouncementImageValidationError | null {
  if (file.size <= 0) {
    return { code: 'empty', message: 'Arquivo de imagem obrigatório.' }
  }

  const mime = file.type?.trim().toLowerCase() ?? ''
  if (!isAllowedAnnouncementImageMime(mime)) {
    return {
      code: 'mime',
      message: 'Tipo de imagem não suportado. Use JPEG, PNG, WebP ou GIF.',
    }
  }

  if (file.size > ANNOUNCEMENT_IMAGE_MAX_BYTES) {
    return {
      code: 'size',
      message: 'Arquivo maior que 10 MB.',
    }
  }

  return null
}

/** Valida body JSON de presign (`contentType` + `sizeBytes` opcional). */
export function validateAnnouncementImagePresign(input: {
  contentType?: string
  sizeBytes?: number
}): AnnouncementImageValidationError | null {
  const contentType = input.contentType?.trim() ?? ''
  if (!contentType) {
    return { code: 'empty', message: 'contentType e originalName são obrigatórios.' }
  }

  if (!isAllowedAnnouncementImageMime(contentType)) {
    return {
      code: 'mime',
      message: 'Tipo de imagem não suportado. Use JPEG, PNG, WebP ou GIF.',
    }
  }

  if (input.sizeBytes != null) {
    if (input.sizeBytes <= 0) {
      return { code: 'empty', message: 'sizeBytes inválido.' }
    }
    if (input.sizeBytes > ANNOUNCEMENT_IMAGE_MAX_BYTES) {
      return { code: 'size', message: 'Arquivo maior que 10 MB.' }
    }
  }

  return null
}
