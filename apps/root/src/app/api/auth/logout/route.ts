import { NextResponse } from 'next/server'

import { clearSession } from '@portal/core/auth/session'

/**
 * BFF de logout. Apaga os cookies de sessão (httpOnly) no server e responde ok.
 * Idempotente: encerrar uma sessão inexistente é no-op. POST porque muda estado
 * — um GET poderia ser disparado por prefetch e derrubar a sessão sem intenção.
 */
export async function POST() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
