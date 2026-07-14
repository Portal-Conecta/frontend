import { NextResponse } from 'next/server'

import { moveStudent } from '@portal/mapa-salas/services/server/roomMapService'
import type { MoveStudentRequest } from '@portal/mapa-salas/types'

import { bffErrorResponse } from '../../../../_lib/bffError'

/**
 * BFF — move um aluno de assento
 * (`PATCH /api/mapa-salas/mapas/{id}/locations/move`). Delega ao service
 * server; 204 sem corpo em caso de sucesso, espelhando o back.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = (await req.json()) as MoveStudentRequest

  try {
    await moveStudent(id, body)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}