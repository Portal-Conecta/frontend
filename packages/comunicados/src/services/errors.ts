import type { ApiError } from '../types'

/**
 * Erros de transporte do módulo. Promoção para `@portal/core` (HttpError genérico)
 * está prevista — ver discussão na PR #218.
 */
export type ComunicadosApiErrorKind =
  | 'not_found'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'server'
  | 'network'

export class ComunicadosApiError extends Error {
  constructor(
    public readonly kind: ComunicadosApiErrorKind,
    public readonly status?: number,
    public readonly body?: ApiError,
    message?: string,
    options?: { cause?: unknown },
  ) {
    super(message ?? kind, options)
    this.name = 'ComunicadosApiError'
  }
}
