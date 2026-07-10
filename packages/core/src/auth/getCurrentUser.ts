/**
 * getCurrentUser — monta o `CurrentUser` da sessão atual (server-only).
 *
 * Ponto do BFF onde os claims do JWT viram o "crachá": lê o access token do cookie
 * httpOnly (via `getSession`, server-only) e delega ao parser puro. Fica FORA do
 * barrel de `@portal/core` de propósito — como `session.ts` — para não entrar em
 * bundle client. Importe por subpath: `@portal/core/auth/getCurrentUser`.
 *
 * Perfil (nome/email/avatar) é carregado à parte pelo endpoint self-scoped `GET /me`.
 */
import { parseUserFromToken, type CurrentUser } from '../rbac'
import { getSession } from './session'

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return parseUserFromToken(await getSession())
}
