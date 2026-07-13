import { NextResponse } from 'next/server'

import { listRoomMaps } from '@portal/mapa-salas/services/server/roomMapService'

import { bffErrorResponse } from '../_lib/bffError'

/**
 * BFF — lista os mapas de sala salvos, paginado. Repassa só a paginação
 * documentada do back (`page`/`size`) e delega ao service server, que resolve
 * o JWT do cookie httpOnly.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  try {
    const data = await listRoomMaps({
      page: searchParams.get('page'),
      size: searchParams.get('size'),
    })
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
