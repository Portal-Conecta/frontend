import { NextResponse } from 'next/server'

import { HttpError, httpErrorStatus } from './errors'

/**
 * Converte um erro de service server (`HttpError`) na resposta JSON do BFF.
 *
 * O status reaproveita o original do backend preservado no `HttpError` (via
 * `httpErrorStatus`); `message`/`errors[]` do envelope seguem para o client
 * mapear por campo — inclusive o 400 do limite de representantes, que **nunca**
 * deve ser engolido aqui. Erros que não são `HttpError` viram 503 genérico.
 *
 * Gêmeo dos helpers locais `api/comunicados/_lib/bffError` e
 * `api/mapa-salas/_lib/bffError`; vive no core para ser reusado por route
 * handlers de qualquer árvore sob `apps/root/src/app/api`.
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
