import { NextResponse } from 'next/server'

import { archiveRoomMap } from '@portal/mapa-salas/services/server/roomMapService'

import { bffErrorResponse } from '../../../_lib/bffError'

/**
 * BFF — arquiva o mapa (`PATCH /api/mapa-salas/mapas/{id}/arquivar`).
 * Soft delete no back; delega ao service server; 204 sem corpo.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    await archiveRoomMap(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}