import { login, AuthError, type AuthErrorKind } from '@portal/core/auth/authService'
import { setSession } from '@portal/core/auth/session'

/**
 * BFF de login. Recebe credenciais do client, delega ao authService (que fala
 * com o back Java) e, no sucesso, grava a sessão em cookies httpOnly. O token
 * nunca volta no corpo da resposta — só o cookie, invisível ao JS do browser.
 */

const STATUS_BY_KIND: Record<AuthErrorKind, number> = {
  invalid_credentials: 401,
  validation: 422,
  server: 503,
  network: 503,
}

export async function POST(req: Request) {
  let body: { email?: string; senha?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ code: 'validation' }, { status: 422 })
  }

  const { email, senha } = body
  if (!email || !senha) {
    return Response.json({ code: 'validation' }, { status: 422 })
  }

  try {
    const session = await login(email, senha)
    await setSession(session)
    return new Response(null, { status: 204 })
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ code: err.kind }, { status: STATUS_BY_KIND[err.kind] })
    }
    return Response.json({ code: 'server' }, { status: 503 })
  }
}
