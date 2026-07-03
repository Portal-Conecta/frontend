import { NextResponse } from 'next/server'

import { HttpError } from '@portal/core/http/errors'

/**
 * Converte um erro do service server (`HttpError`) na resposta do BFF.
 *
 * O `HttpError` já carrega o `status` original do back (o http client o preenche
 * com `mapStatusToKind`), então reaproveitamos esse status em vez de remontar uma
 * tabela `kind → status`. Só os erros sem resposta — sessão ausente
 * (`unauthorized`) e falha de rede — não têm status e caem no fallback. O
 * `message`/`errors[]` do envelope segue para o client mapear por campo.
 */
export function bffErrorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    const status = err.status ?? (err.kind === 'unauthorized' ? 401 : 503)
    return NextResponse.json(
      { code: err.kind, message: err.body?.message, errors: err.body?.errors ?? [] },
      { status },
    )
  }
  return NextResponse.json({ code: 'server' }, { status: 503 })
}
