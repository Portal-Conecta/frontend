import type { ApiError } from '../types'

export type ComunicadosApiErrorKind = 'not_found' | 'validation' | 'unauthorized' | 'server' | 'network'

export class ComunicadosApiError extends Error {
  constructor(
    public readonly kind: ComunicadosApiErrorKind,
    public readonly status?: number,
    public readonly body?: ApiError,
    message?: string,
  ) {
    super(message ?? kind)
    this.name = 'ComunicadosApiError'
  }
}
