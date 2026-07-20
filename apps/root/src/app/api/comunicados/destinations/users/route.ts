import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import { searchUsers } from '@portal/core/classes/userDirectoryService'
import { isTypeUser, TYPE_USER_VALUES } from '@portal/core/rbac'

export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const typeUserParam = searchParams.get('typeUser')
  const search = searchParams.get('search')?.trim()

  // Mesma normalização do `GET /api/users` (ambos proxiam o `searchUsers` do
  // core): `typeUser` inválido é 400 e `size` tem teto — sem drift entre as duas.
  if (typeUserParam && !isTypeUser(typeUserParam)) {
    return NextResponse.json(
      { code: 'validation', message: `typeUser deve ser um de: ${TYPE_USER_VALUES.join(', ')}.` },
      { status: 400 },
    )
  }

  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '20')

  try {
    const data = await searchUsers(
      {
        page: Number.isFinite(page) && page >= 0 ? Math.floor(page) : 0,
        size: Number.isFinite(size) ? Math.min(Math.max(Math.floor(size), 1), 100) : 20,
        ...(typeUserParam ? { typeUser: typeUserParam } : {}),
        ...(search ? { name: search } : {}),
      },
      token,
    )
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json(
        { code: err.kind, message: err.message },
        { status: err.status ?? 503 },
      )
    }
    return NextResponse.json({ code: 'server' }, { status: 503 })
  }
}
