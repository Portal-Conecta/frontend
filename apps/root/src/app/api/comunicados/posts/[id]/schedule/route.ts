import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { rescheduleAnnouncement } from '@portal/comunicados/services/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: { scheduledFor?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation' }, { status: 422 })
  }

  if (!body.scheduledFor) {
    return NextResponse.json({ code: 'validation' }, { status: 422 })
  }

  try {
    const result = await rescheduleAnnouncement(id, body.scheduledFor)
    return NextResponse.json(result)
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500
    return NextResponse.json({ code: 'server' }, { status: Number.isFinite(status) && status > 0 ? status : 500 })
  }
}
