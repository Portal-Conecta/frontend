import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import { listHubUsers } from '@portal/comunicados/services/server/hubCatalogService'
import type { HubUserType } from '@portal/comunicados/types/hub'

const USER_TYPES = new Set<HubUserType>([
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
  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '20')
  const typeUserParam = searchParams.get('typeUser')
  const typeUser =
    typeUserParam && USER_TYPES.has(typeUserParam as HubUserType)
      ? (typeUserParam as HubUserType)
      : undefined

  try {
    const data = await listHubUsers(token, {
      page: Number.isFinite(page) ? page : 0,
      size: Number.isFinite(size) ? size : 20,
      ...(typeUser ? { typeUser } : {}),
    })
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
