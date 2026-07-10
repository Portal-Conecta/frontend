import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import {
  markNotificationsAsRead,
  MAX_READ_BATCH,
} from '@portal/core/notifications/notificationService'

function parseNotificationIds(body: unknown): string[] | null {
  if (typeof body !== 'object' || body === null) return null

  const { notificationIds } = body as { notificationIds?: unknown }
  if (!Array.isArray(notificationIds)) return null
  if (notificationIds.length === 0 || notificationIds.length > MAX_READ_BATCH) return null
  if (!notificationIds.every((id) => typeof id === 'string' && id.length > 0)) return null

  return notificationIds as string[]
}

export async function PATCH(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'corpo inválido' }, { status: 400 })
  }

  const notificationIds = parseNotificationIds(body)
  if (!notificationIds) {
    return NextResponse.json(
      {
        code: 'validation',
        message: `notificationIds deve ser uma lista de 1 a ${MAX_READ_BATCH} ids`,
      },
      { status: 400 },
    )
  }

  try {
    await markNotificationsAsRead(token, notificationIds)
    return new NextResponse(null, { status: 204 })
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
