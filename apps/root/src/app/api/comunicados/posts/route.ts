import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { ComunicadosApiError } from '@portal/comunicados/services/server/comunicadosApiClient'
import { listPosts } from '@portal/comunicados/services/server/postsService'

export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  try {
    const data = await listPosts(Object.fromEntries(searchParams), token)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ComunicadosApiError) {
      return NextResponse.json({ code: err.code }, { status: err.status })
    }
    return NextResponse.json({ code: 'server' }, { status: 503 })
  }
}
