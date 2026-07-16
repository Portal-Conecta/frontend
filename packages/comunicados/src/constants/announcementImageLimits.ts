/** Limite do back (ARQ02) — máximo de arquivos por comunicado. */
export const ANNOUNCEMENT_MAX_IMAGES = 5

/** Limite do back (ARQ06) — tamanho máximo por arquivo em bytes (10 MB). */
export const ANNOUNCEMENT_IMAGE_MAX_BYTES = 10 * 1024 * 1024

/**
 * Allowlist de MIME (ARQ02 — tipo inválido).
 * Alinhada ao que o FileUpload do DS aceita por padrão (`image/*` restrito).
 */
export const ANNOUNCEMENT_IMAGE_MIME_ALLOWLIST = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type AnnouncementImageMime = (typeof ANNOUNCEMENT_IMAGE_MIME_ALLOWLIST)[number]

/** Valor de `accept` do `<input type="file">` / FileUpload. */
export const ANNOUNCEMENT_IMAGE_ACCEPT = ANNOUNCEMENT_IMAGE_MIME_ALLOWLIST.join(',')
