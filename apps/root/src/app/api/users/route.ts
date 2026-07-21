import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { searchUsers, type ListUsersParams } from '@portal/core/classes/userDirectoryService'
import { isUserAccountStatus, USER_ACCOUNT_STATUS_VALUES, type UserAccountStatus } from '@portal/core/classes/types'
import { bffErrorResponse } from '@portal/core/http/bffError'
import { createUser } from '@portal/core/profile/profileService'
import { parseCreateUser } from '@portal/core/profile/profileValidation'
import { isTypeUser, TYPE_USER_VALUES } from '@portal/core/rbac'
const DEFAULT_SIZE = 20
const MAX_SIZE = 100

/** Página >= 0; tamanho preso entre 1 e `MAX_SIZE` (teto evita `?size=999999`). */
function normalizePage(raw: string | null): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}
function normalizeSize(raw: string | null): number {
  if (raw == null || raw === '') return DEFAULT_SIZE
  const n = Number(raw)
  if (!Number.isFinite(n)) return DEFAULT_SIZE
  return Math.min(Math.max(Math.floor(n), 1), MAX_SIZE)
}

/**
 * BFF — busca paginada de usuários do sistema (tela "adicionar usuários").
 * Proxy de `GET /hub/users`; `typeUser` desconhecido é erro explícito (400),
 * `page`/`size` são normalizados (`size` limitado a `MAX_SIZE`); `search`
 * filtra por nome e `status` aceita valores repetidos, ambos repassados ao
 * core. `withoutActiveClass` vira `semTurmaAtiva` pro core (nome do campo lá
 * é em português). Sessão ausente cai em 401 pelo http client do service.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const typeUserParam = searchParams.get('typeUser')
  const typeUser = typeUserParam && isTypeUser(typeUserParam) ? typeUserParam : undefined
  const search = searchParams.get('search')?.trim()
  const statuses = searchParams.getAll('status').filter(Boolean)
  const withoutActiveClass = searchParams.get('withoutActiveClass') === 'true'

  if (typeUserParam && !typeUser) {
    return NextResponse.json(
      { code: 'validation', message: `typeUser deve ser um de: ${TYPE_USER_VALUES.join(', ')}.` },
      { status: 400 },
    )
  }

  const invalidStatus = statuses.find((status) => !isUserAccountStatus(status))
  if (invalidStatus) {
    return NextResponse.json(
      { code: 'validation', message: `status deve ser um de: ${USER_ACCOUNT_STATUS_VALUES.join(', ')}.` },
      { status: 400 },
    )
  }

  const params: ListUsersParams = {
    page: normalizePage(searchParams.get('page')),
    size: normalizeSize(searchParams.get('size')),
    ...(typeUser ? { typeUser } : {}),
    ...(search ? { name: search } : {}),
    ...(statuses.length > 0 ? { status: statuses as UserAccountStatus[] } : {}),
    ...(withoutActiveClass ? { semTurmaAtiva: true } : {}),
  }

  try {
    return NextResponse.json(await searchUsers(params))
  } catch (err) {
    return bffErrorResponse(err)
  }
}

/** BFF — cria usuário após validar nome, e-mail e tipo obrigatórios. */
export async function POST(req: Request) {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = parseCreateUser(body)
  if (!parsed.ok) {
    return NextResponse.json(
      { code: 'validation', message: 'Dados inválidos para criação de usuário.', errors: parsed.errors },
      { status: 400 },
    )
  }
  try {
    return NextResponse.json(await createUser(parsed.value, token), { status: 201 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
