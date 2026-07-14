import { NextResponse } from 'next/server'

import { searchUsers, type ListUsersParams } from '@portal/core/classes/userDirectoryService'
import { bffErrorResponse } from '@portal/core/http/bffResponse'
import type { TypeUser } from '@portal/core/rbac'

const USER_TYPES = new Set<TypeUser>([
  'STUDENT',
  'REPRESENTATIVE',
  'TEACHER',
  'SENAI',
  'WEG',
  'ADMIN',
])

/**
 * BFF — busca paginada de usuários do sistema (tela "adicionar usuários").
 * Proxy de `GET /hub/users`; ignora `typeUser` desconhecido e normaliza
 * `page`/`size`. Sessão ausente cai em 401 pelo http client do service.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '20')
  const typeUserParam = searchParams.get('typeUser')
  const typeUser =
    typeUserParam && USER_TYPES.has(typeUserParam as TypeUser)
      ? (typeUserParam as TypeUser)
      : undefined

  const params: ListUsersParams = {
    page: Number.isFinite(page) ? page : 0,
    size: Number.isFinite(size) ? size : 20,
    ...(typeUser ? { typeUser } : {}),
  }

  try {
    return NextResponse.json(await searchUsers(params))
  } catch (err) {
    return bffErrorResponse(err)
  }
}
