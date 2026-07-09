import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import {
  DEFAULT_PAGE_SIZE,
  getNotifications,
} from '@portal/core/notifications/notificationService'
import { isNotificationStatus } from '@portal/core/notifications/types'

function parseIndex(raw: string | null, fallback: number): number {
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  if (!isNotificationStatus(status)) {
    return NextResponse.json(
      { code: 'validation', message: 'status deve ser READ ou UNREAD' },
      { status: 400 },
    )
  }

  const size = parseIndex(searchParams.get('size'), DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE

  try {
    const data = await getNotifications(token, {
      status,
      page: parseIndex(searchParams.get('page'), 0),
      size,
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
