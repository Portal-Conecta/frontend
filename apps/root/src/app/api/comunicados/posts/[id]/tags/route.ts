import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import {
  getPostTags,
  PostsError,
  type PostsErrorKind,
} from '@portal/comunicados/services/postsService'

const STATUS_BY_KIND: Record<PostsErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  server: 503,
  network: 503,
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const tags = await getPostTags(id, token)
    return NextResponse.json(tags)
  } catch (err) {
    if (err instanceof PostsError) {
      return NextResponse.json(
        { code: err.kind, message: err.message, errors: err.fieldErrors },
        { status: STATUS_BY_KIND[err.kind] },
      )
    }
    return NextResponse.json({ code: 'server' }, { status: 503 })
  }
}