import type { ApiError } from '@portal/shared'

export type HttpErrorKind =
  | 'not_found'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'server'
  | 'network'

export class HttpError extends Error {
  constructor(
    public readonly kind: HttpErrorKind,
    public readonly status?: number,
    public readonly body?: ApiError,
    message?: string,
    options?: { cause?: unknown },
  ) {
    super(message ?? kind, options)
    this.name = 'HttpError'
  }
}

export function mapStatusToKind(status: number): HttpErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 400 || status === 422) return 'validation'
  return 'server'
}
