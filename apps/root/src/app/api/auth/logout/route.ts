import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { logout } from '@portal/core/auth/authService'
import { clearSession } from '@portal/core/auth/session'
import { REFRESH_COOKIE } from '@portal/core/auth/cookies'

/**
 * BFF de logout. Invalida o refresh token no gateway e apaga os cookies de
 * sessão (httpOnly) no server. Idempotente: encerrar uma sessão inexistente
 * é no-op. POST porque muda estado — um GET poderia ser disparado por
 * prefetch e derrubar a sessão sem intenção.
 *
 * Falha do gateway não bloqueia a limpeza local: pior caso é o refresh token
 * ficar válido no back por mais tempo, mas o usuário não fica preso numa
 * sessão que não consegue encerrar no próprio browser.
 */
export async function POST() {
  const store = await cookies()
  const refreshToken = store.get(REFRESH_COOKIE)?.value

  if (refreshToken) {
    try {
      await logout(refreshToken)
    } catch (err) {
      console.error('Falha ao invalidar refresh token no gateway:', err)
    }
  }

  await clearSession()
  return NextResponse.json({ ok: true })
}