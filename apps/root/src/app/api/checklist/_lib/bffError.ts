import { NextResponse } from 'next/server'

import { HttpError, httpErrorStatus } from '@portal/core/http/errors'

export function bffErrorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json(
      { code: err.kind, message: err.body?.message, errors: err.body?.errors ?? [] },
      { status: httpErrorStatus(err) },
    )
  }

  return NextResponse.json({ code: 'server' }, { status: httpErrorStatus(err) })
}