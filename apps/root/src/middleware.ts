import { NextResponse, type NextRequest } from 'next/server'

import { ACCESS_COOKIE, REFRESH_COOKIE } from '@portal/core/auth/cookies'

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
 * Quando o access expira mas o refresh ainda existe, o middleware delega para
 * `/api/auth/refresh` (Route Handler server-side, fora do Edge) que lê o cookie
 * httpOnly, chama o back e regrava a sessão antes de redirecionar o usuário de
 * volta à rota original.
 *
 * Público: `/login`. Protegido: todo o resto (ver `matcher`).
 */

const LOGIN = '/login'
const HOME = '/comunicados'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasAccess = Boolean(req.cookies.get(ACCESS_COOKIE)?.value)
  const hasRefresh = Boolean(req.cookies.get(REFRESH_COOKIE)?.value)
  const isPublic = pathname === LOGIN

  // Já autenticado tentando ver o login (ou a raiz) → área autenticada.
  if (hasAccess && (isPublic || pathname === '/')) {
    return NextResponse.redirect(new URL(HOME, req.url))
  }

  // Access expirou mas refresh ainda vive → delega renovação ao Route Handler.
  // O Route Handler está em /api/*, excluído do matcher, então não há loop.
  if (!hasAccess && hasRefresh && !isPublic) {
    const target = new URL('/api/auth/refresh', req.url)
    target.searchParams.set('next', pathname)
    return NextResponse.redirect(target)
  }

  // Sem nenhuma sessão em rota protegida → login.
  if (!hasAccess && !isPublic) {
    return NextResponse.redirect(new URL(LOGIN, req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Roda em tudo, menos estáticos do Next, arquivos com extensão e rotas de API
  // (que cuidam da própria auth e devem responder JSON, não redirect HTML).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
}
