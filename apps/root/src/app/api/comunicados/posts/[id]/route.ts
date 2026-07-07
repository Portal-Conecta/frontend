import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import {
  getPostDetail,
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
    const detail = await getPostDetail(id, token)
    return NextResponse.json(detail)
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

/**
 * BFF — soft delete de um comunicado próprio. Delega ao service server (JWT do
 * cookie httpOnly) e devolve 204 no sucesso, sem corpo.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    await deletePost(id)
    return new NextResponse(null, { status: 204 })
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

function deletePost(id: string) {
  throw new Error('Function not implemented.')
}

