/** Motivo de rejeição ao processar arquivos no `FileUpload`. */
export type FileRejectionReason = 'invalid-type' | 'limit-exceeded' | 'too-large'

export interface FileRejection {
  file: File
  reason: FileRejectionReason
}

export interface ProcessFilesResult {
  accepted: File[]
  rejected: FileRejection[]
}

/** Casa o `type` do arquivo com um padrão de `accept` (`'image/*'`, `'image/png,application/pdf'`, ...). */
function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((pattern) => pattern.trim())
    .filter(Boolean)

  if (patterns.length === 0) return true

  return patterns.some((pattern) =>
    pattern.endsWith('/*') ? file.type.startsWith(pattern.slice(0, -1)) : file.type === pattern,
  )
}

/**
 * Filtra e limita arquivos para o uploader.
 *
 * - Rejeita o que não casar com `accept` (padrão `'image/*'`).
 * - Rejeita o que exceder `maxSize` em bytes, quando informado.
 * - Aceita no máximo `remaining` arquivos; o excedente vai para `limit-exceeded`.
 */
export function processFiles(
  files: FileList | readonly File[] | null,
  remaining: number,
  accept: string = 'image/*',
  maxSize?: number,
): ProcessFilesResult {
  if (!files || files.length === 0 || remaining <= 0) {
    return { accepted: [], rejected: [] }
  }

  const accepted: File[] = []
  const rejected: FileRejection[] = []

  for (const file of Array.from(files)) {
    if (!matchesAccept(file, accept)) {
      rejected.push({ file, reason: 'invalid-type' })
      continue
    }
    if (maxSize != null && file.size > maxSize) {
      rejected.push({ file, reason: 'too-large' })
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
  rejections: readonly FileRejection[],
  maxFiles: number,
): string | null {
  if (rejections.length === 0) return null

  const invalidType = rejections.filter((item) => item.reason === 'invalid-type').length
  const tooLarge = rejections.filter((item) => item.reason === 'too-large').length
  const limitExceeded = rejections.filter((item) => item.reason === 'limit-exceeded').length
  const parts: string[] = []

  if (invalidType > 0) {
    parts.push(
      invalidType === 1
        ? '1 arquivo tem um formato não aceito'
        : `${invalidType} arquivos têm um formato não aceito`,
    )
  }
  if (tooLarge > 0) {
    parts.push(
      tooLarge === 1
        ? '1 arquivo excedeu o tamanho máximo'
        : `${tooLarge} arquivos excederam o tamanho máximo`,
    )
  }
  if (limitExceeded > 0) {
    parts.push(
      limitExceeded === 1
        ? `1 arquivo excedeu o limite de ${maxFiles} arquivos`
        : `${limitExceeded} arquivos excederam o limite de ${maxFiles} arquivos`,
    )
  }

  return `${parts.join('. ')}.`
}
