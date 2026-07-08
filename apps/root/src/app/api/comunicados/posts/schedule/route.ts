import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import {
  schedulePost,
  PostsError,
  type PostsErrorKind,
} from '@portal/comunicados/services/postsService'
import type { ScheduleAnnouncementRequest } from '@portal/comunicados/types/announcement'

/**
 * BFF de agendar comunicado. Igual ao publish, mas para `/api/posts/schedule`:
 * o comunicado nasce SCHEDULED e `scheduledFor` precisa ser futuro (o back
 * responde 400 caso contrário). Lê o JWT do cookie httpOnly e delega ao
 * postsService com `Authorization: Bearer`.
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

  let body: ScheduleAnnouncementRequest
  try {
    body = (await req.json()) as ScheduleAnnouncementRequest
  } catch {
    return NextResponse.json({ code: 'validation' }, { status: 400 })
  }

  try {
    const announcement = await schedulePost(body, token)
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
