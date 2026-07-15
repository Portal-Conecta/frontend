import { NextResponse } from 'next/server'

import { HttpError, httpErrorStatus } from './errors'

/**
 * Converte um erro do service server (`HttpError`) na resposta do BFF.
 *
 * O status vem de `httpErrorStatus` (reaproveita o status original do back
 * preservado no `HttpError`); o `message`/`errors[]` do envelope segue para o
 * client mapear por campo. Erros que não são `HttpError` viram um 503 genérico.
 *
 * Precisa de `next/server` — de propósito fora do barrel `./index.ts` (mesmo
 * padrão de `auth/index.ts` e `errorPresentation.ts`): quem precisa importa
 * por subpath direto (`@portal/core/http/bffError`).
 */
export function bffErrorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json(
      { code: err.kind, message: err.body?.message, errors: err.body?.errors ?? [] },
      { status: httpErrorStatus(err) },
    )
  }
  return NextResponse.json({ code: 'server' }, { status: httpErrorStatus(err) })
}
