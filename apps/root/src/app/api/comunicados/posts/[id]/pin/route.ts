import { NextResponse } from 'next/server'

import { pinAnnouncement } from '@portal/comunicados/services/server/announcementsService'

import { bffErrorResponse } from '../../../_lib/bffError'

/** BFF — fixa um comunicado no mural, retornando o estado atualizado. */
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const data = await pinAnnouncement(id)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
