import { NextResponse } from 'next/server'

import { deleteAnnouncement } from '@portal/comunicados/services/server/announcementsService'

import { bffErrorResponse } from '../../_lib/bffError'

/**
 * BFF — soft delete de um comunicado próprio. Delega ao service server (JWT do
 * cookie httpOnly) e devolve 204 no sucesso, sem corpo.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    await deleteAnnouncement(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
