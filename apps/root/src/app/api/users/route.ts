import { NextResponse } from 'next/server'

import { searchUsers, type ListUsersParams } from '@portal/core/classes/userDirectoryService'
import { bffErrorResponse } from '@portal/core/http/bffError'
import type { TypeUser } from '@portal/core/rbac'

const USER_TYPES = new Set<TypeUser>([
  'STUDENT',
  'REPRESENTATIVE',
  'TEACHER',
  'SENAI',
  'WEG',
  'ADMIN',
])

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
 * `page`/`size` são normalizados (`size` limitado a `MAX_SIZE`) e `search`
 * filtra por nome (substring, case-insensitive — repassado como `name` pro
 * core). Sessão ausente cai em 401 pelo http client do service.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const typeUserParam = searchParams.get('typeUser')
  const search = searchParams.get('search')?.trim()

  if (typeUserParam && !USER_TYPES.has(typeUserParam as TypeUser)) {
    return NextResponse.json(
      { code: 'validation', message: `typeUser deve ser um de: ${[...USER_TYPES].join(', ')}.` },
      { status: 400 },
    )
  }

  const params: ListUsersParams = {
    page: normalizePage(searchParams.get('page')),
    size: normalizeSize(searchParams.get('size')),
    ...(typeUserParam ? { typeUser: typeUserParam as TypeUser } : {}),
    ...(search ? { name: search } : {}),
  }

  try {
    return NextResponse.json(await searchUsers(params))
  } catch (err) {
    return bffErrorResponse(err)
  }
}
