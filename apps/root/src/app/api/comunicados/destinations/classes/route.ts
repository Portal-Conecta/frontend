import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import { listHubClasses } from '@portal/comunicados/services/server/hubCatalogService'

export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '0')
  const size = Number(searchParams.get('size') ?? '100')

  try {
    const data = await listHubClasses(token, {
      page: Number.isFinite(page) ? page : 0,
      size: Number.isFinite(size) ? size : 100,
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
