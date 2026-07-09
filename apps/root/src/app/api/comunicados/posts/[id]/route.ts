import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { deletePost, getPostDetail } from '@portal/comunicados/services/server/postsService'

import {
  getAnnouncement,
  updateAnnouncement,
} from '@portal/comunicados/services/server/postsService'
import type { AnnouncementUpdatePayload } from '@portal/comunicados/types/announcement'

import { bffErrorResponse } from '../../_lib/bffError'

/** BFF — detalhe de um post. Delega ao service server (JWT do cookie httpOnly). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const result = await getAnnouncement(id)
    return NextResponse.json(result)
  } catch (err) {
    return bffErrorResponse(err)
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: AnnouncementUpdatePayload
  try {
    body = (await req.json()) as AnnouncementUpdatePayload
  } catch {
    return NextResponse.json({ code: 'validation' }, { status: 400 })
  }

  try {
    const result = await updateAnnouncement(id, body)
    return NextResponse.json(result)
  } catch (err) {
    return bffErrorResponse(err)
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
    return bffErrorResponse(err)
  }
}
