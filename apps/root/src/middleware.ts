import { NextResponse, type NextRequest } from 'next/server'

import { ACCESS_COOKIE } from '@portal/core/auth/cookies'

/**
 * Roteamento protegido (Edge).
 *
 * Sessão = presença do cookie `access_token`. Como ele é gravado com
 * `maxAge = expiresIn`, expira sozinho junto com o access — a checagem de
 * presença já vale como checagem de validade, sem decodificar JWT no Edge.
 *
 * IMPORTANTE: este é um gate OTIMISTA, não uma fronteira de segurança. Ele não
 * verifica a assinatura do JWT — um cookie forjado passa. A autorização real é
 * do back, que valida o token em toda chamada de dados.
 *
 * Público: `/login`. Protegido: todo o resto (ver `matcher`).
 */

const LOGIN = '/login'
const HOME = '/comunicados'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSession = Boolean(req.cookies.get(ACCESS_COOKIE)?.value)
  const isPublic = pathname === LOGIN

  // Já logado tentando ver o login (ou a raiz) → manda pra área autenticada.
  if (hasSession && (isPublic || pathname === '/')) {
    return NextResponse.redirect(new URL(HOME, req.url))
  }

  // Sem sessão tentando rota protegida → manda pro login.
  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL(LOGIN, req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Roda em tudo, menos estáticos do Next, arquivos com extensão e rotas de API
  // (que cuidam da própria auth e devem responder JSON, não redirect HTML).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
}
