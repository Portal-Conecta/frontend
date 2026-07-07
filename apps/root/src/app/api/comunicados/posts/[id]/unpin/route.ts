import { NextResponse } from 'next/server'

import { unpinAnnouncement } from '@portal/comunicados/services/server/announcementsService'

import { bffErrorResponse } from '../../../_lib/bffError'

/** BFF — desafixa um comunicado, retornando o estado atualizado. */
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const data = await unpinAnnouncement(id)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
