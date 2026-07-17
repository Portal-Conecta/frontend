import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import { searchUsers } from '@portal/core/classes/userDirectoryService'
import type { TypeUser } from '@portal/core/rbac'

const USER_TYPES = new Set<TypeUser>([
  'STUDENT',
  'REPRESENTATIVE',
  'TEACHER',
  'SENAI',
  'WEG',
  'ADMIN',
])

export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const typeUserParam = searchParams.get('typeUser')

  // Mesma normalização do `GET /api/users` (ambos proxiam o `searchUsers` do
  // core): `typeUser` inválido é 400 e `size` tem teto — sem drift entre as duas.
  if (typeUserParam && !USER_TYPES.has(typeUserParam as TypeUser)) {
    return NextResponse.json(
      { code: 'validation', message: `typeUser deve ser um de: ${[...USER_TYPES].join(', ')}.` },
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
        ...(typeUserParam ? { typeUser: typeUserParam as TypeUser } : {}),
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
