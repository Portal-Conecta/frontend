import { NextResponse } from 'next/server'

import { updateAllocations } from '@portal/mapa-salas/services/server/roomMapService'
import type { UpdateRoomMapAllocationsRequest } from '@portal/mapa-salas/types'

import { bffErrorResponse } from '../../../_lib/bffError'

/**
 * BFF — salva o conjunto de alocações de um mapa existente
 * (`PUT /api/mapa-salas/mapas/{id}/allocations`). Delega ao service server,
 * que resolve o JWT do cookie httpOnly. Erros do back (400 de validação,
 * 403 de permissão, 404 de mapa) seguem via `bffErrorResponse`.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = (await req.json()) as UpdateRoomMapAllocationsRequest

  try {
    const data = await updateAllocations(id, body)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}