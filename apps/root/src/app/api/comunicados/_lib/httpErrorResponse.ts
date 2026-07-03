import { NextResponse } from 'next/server'

import { HttpError, type HttpErrorKind } from '@portal/core/http/errors'

const STATUS_BY_KIND: Record<HttpErrorKind, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation: 422,
  server: 503,
  network: 503,
}

/** Converte um `HttpError` (ou erro inesperado) na resposta JSON do Route Handler BFF. */
export function httpErrorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ code: error.kind }, { status: STATUS_BY_KIND[error.kind] })
  }
  return NextResponse.json({ code: 'server' }, { status: 503 })
}
