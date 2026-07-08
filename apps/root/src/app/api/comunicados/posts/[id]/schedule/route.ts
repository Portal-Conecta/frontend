import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { rescheduleAnnouncement } from '@portal/comunicados/services/server/postsService'

import { bffErrorResponse } from '../../../_lib/bffError'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: { scheduledFor?: string }
  try {
    body = (await req.json()) as { scheduledFor?: string }
  } catch {
    return NextResponse.json({ code: 'validation' }, { status: 400 })
  }

  if (!body.scheduledFor) {
    return NextResponse.json(
      { code: 'validation', message: 'scheduledFor é obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const result = await rescheduleAnnouncement(id, body.scheduledFor)
    return NextResponse.json(result)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
