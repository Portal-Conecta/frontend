import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import {
  publishPost,
  PostsError,
  type PostsErrorKind,
} from '@portal/comunicados/services/postsService'
import type { PublishAnnouncementRequest } from '@portal/comunicados/types/announcement'

/**
 * BFF de publicar comunicado. Recebe o body do client, lê o JWT do cookie
 * httpOnly (getSession) e delega ao postsService, que chama o API Gateway em
 * `/comunicados/api/posts/publish` com `Authorization: Bearer`.
 *
 * Espelha o status do back (201 no sucesso) e repassa os `errors[]` de validação
 * (400) para o form mapear por campo.
 */

const STATUS_BY_KIND: Record<PostsErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  server: 503,
  network: 503,
}

export async function POST(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  let body: PublishAnnouncementRequest
  try {
    body = (await req.json()) as PublishAnnouncementRequest
  } catch {
    return NextResponse.json({ code: 'validation' }, { status: 400 })
  }

  try {
    const announcement = await publishPost(body, token)
    return NextResponse.json(announcement, { status: 201 })
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
