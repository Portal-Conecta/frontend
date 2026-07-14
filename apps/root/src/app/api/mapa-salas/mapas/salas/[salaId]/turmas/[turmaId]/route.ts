import { NextResponse } from 'next/server'

import { getRoomMapView } from '@portal/mapa-salas/services/server/roomMapService'

import { bffErrorResponse } from '../../../../../_lib/bffError'

/**
 * BFF — visualização do mapa de sala de uma turma. Delega ao service server
 * (JWT do cookie httpOnly). Turma sem mapa salvo volta como sugestão
 * alfabética (`suggested: true`, `map: null`); erros do back (401/403/404)
 * seguem via `bffErrorResponse`.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ salaId: string; turmaId: string }> },
) {
  const { salaId, turmaId } = await params

  try {
    const data = await getRoomMapView(salaId, turmaId)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
