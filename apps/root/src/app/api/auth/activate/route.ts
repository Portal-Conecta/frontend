import { NextResponse } from 'next/server'

import {
  activateAccount,
  ActivationError,
  isValidActivationPassword,
  type ActivationErrorKind,
} from '@portal/core/auth/authService'

const STATUS_BY_KIND: Record<ActivationErrorKind, number> = {
  activation_invalid: 400,
  activation_expired: 400,
  activation_used: 400,
  validation: 422,
  server: 503,
  network: 503,
}

function isActivationRequest(body: unknown): body is { token: string; newPassword: string } {
  if (typeof body !== 'object' || body === null) return false

  const { token, newPassword } = body as Record<string, unknown>
  return typeof token === 'string' && token.length > 0 && isValidActivationPassword(newPassword)
}

/** BFF público: não cria cookies nem expõe o token ou a senha na resposta. */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation' }, { status: 422 })
  }

  if (!isActivationRequest(body)) {
    return NextResponse.json({ code: 'validation' }, { status: 422 })
  }

  try {
    await activateAccount(body.token, body.newPassword)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof ActivationError) {
      return NextResponse.json({ code: err.kind }, { status: STATUS_BY_KIND[err.kind] })
    }
    return NextResponse.json({ code: 'server' }, { status: 503 })
  }
}
