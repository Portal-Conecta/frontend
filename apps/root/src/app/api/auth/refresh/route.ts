import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { refresh } from '@portal/core/auth/authService'
import { setSession, clearSession } from '@portal/core/auth/session'
import { REFRESH_COOKIE } from '@portal/core/auth/cookies'
import { safeNext } from '@portal/core/auth/safeNext'
import type { LoginResponse } from '@portal/core/auth/authService'

/**
 * BFF de refresh. Acionado pelo middleware via redirect quando o access_token
 * expirou mas o refresh_token ainda existe.
 *
 * Single-flight via Map: requisições concorrentes com o mesmo refresh token
 * compartilham uma única chamada ao back. Todos os waiters recebem os mesmos
 * novos tokens e cada um chama setSession de forma independente (request-scoped).
 * Cobre o cenário real: servidor Node tradicional (container único).
 *
 * Escala futura: se o projeto migrar para multi-instância/serverless, o Map não
 * coordena entre instâncias distintas. Solução preferida (sem mudar o front):
 * pedir ao time de back um grace period de ~5s no token antigo após rotação
 * (padrão Auth0/Firebase). Alternativa: lock distribuído com Upstash KV/Redis.
 */

const inFlight = new Map<string, Promise<LoginResponse>>()

function singleFlightRefresh(token: string): Promise<LoginResponse> {
  if (!inFlight.has(token)) {
    const p = refresh(token).finally(() => inFlight.delete(token))
    inFlight.set(token, p)
  }
  return inFlight.get(token)!
}

// GET porque o middleware redireciona o browser (302 → GET de navegação).
export async function GET(req: Request) {
  const url = new URL(req.url)
  // Sanitiza contra open redirect resolvendo a URL e exigindo mesma origin
  // (ver @portal/core/auth/safeNext).
  const next = safeNext(url.searchParams.get('next'), req.url)

  const store = await cookies()
  const refreshToken = store.get(REFRESH_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const session = await singleFlightRefresh(refreshToken)
    await setSession(session)
    return NextResponse.redirect(new URL(next, req.url))
  } catch {
    // Limpa sempre: sem limpeza, o middleware vê o refresh cookie e redireciona
    // de volta aqui indefinidamente (loop). Erros transitórios de rede também
    // caem aqui — o usuário faz novo login quando a rede se recuperar.
    await clearSession()
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
