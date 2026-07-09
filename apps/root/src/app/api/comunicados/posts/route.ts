import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError, type HttpErrorKind } from '@portal/core/http'
import { listPosts } from '@portal/comunicados/services/server/postsService'
import { ANNOUNCEMENT_STATUS, type AnnouncementStatus, type ListPostsParams } from '@portal/comunicados/types'

const STATUS_BY_KIND: Record<HttpErrorKind, number> = {
  not_found: 404,
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  server: 503,
  network: 503,
}

function numberParam(searchParams: URLSearchParams, key: 'page' | 'size'): number | undefined {
  const value = searchParams.get(key)
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function isAnnouncementStatus(value: string | null): value is AnnouncementStatus {
  return (
    typeof value === 'string' &&
    (Object.values(ANNOUNCEMENT_STATUS) as readonly string[]).includes(value)
  )
}

function listParams(searchParams: URLSearchParams): ListPostsParams {
  const params: ListPostsParams = {}
  const page = numberParam(searchParams, 'page')
  const size = numberParam(searchParams, 'size')
  const search = searchParams.get('search')
  const status = searchParams.get('status')

  if (page !== undefined) params.page = page
  if (size !== undefined) params.size = size
  if (search) params.search = search
  if (isAnnouncementStatus(status)) params.status = status

  return params
}

export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  try {
    const data = await listPosts(listParams(searchParams))
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json(
        { code: err.kind },
        { status: STATUS_BY_KIND[err.kind] },
      )
    }
    return NextResponse.json({ code: 'server' }, { status: 503 })
  }
}
