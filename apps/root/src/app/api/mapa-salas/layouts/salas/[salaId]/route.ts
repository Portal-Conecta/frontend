import { NextResponse } from 'next/server'

import { getRoomLayout } from '@portal/mapa-salas/services/server/roomLayoutService'

import { bffErrorResponse } from '../../../_lib/bffError'

/**
 * BFF — layout da sala (template + posições) para o professor montar o mapa.
 * Delega ao service server (JWT do cookie httpOnly); erros do back
 * (401/403/404) seguem via `bffErrorResponse`.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ salaId: string }> },
) {
  const { salaId } = await params

  try {
    const data = await getRoomLayout(salaId)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
