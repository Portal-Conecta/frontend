import { NextResponse } from 'next/server'

import { createRoomMap, listRoomMaps } from '@portal/mapa-salas/services/server/roomMapService'
import type { CreateRoomMapRequest } from '@portal/mapa-salas/types'

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

/** Guard mínimo do body (tipos de #286): os três ids obrigatórios presentes e não vazios. */
function isCreateRoomMapRequest(body: unknown): body is CreateRoomMapRequest {
  if (typeof body !== 'object' || body === null) return false
  const { classId, roomId, layoutTemplateId } = body as Record<string, unknown>
  return [classId, roomId, layoutTemplateId].every(
    (value) => typeof value === 'string' && value.length > 0,
  )
}

/**
 * BFF — cria o mapa de sala de uma turma. Delega ao service server (JWT do
 * cookie httpOnly) e responde 201 com a view criada. A permissão é do back
 * (role TEACHER): o 403 dele segue como `forbidden` via `bffErrorResponse`,
 * junto com os demais erros (401/400 com `errors[]` por campo).
 */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation' }, { status: 400 })
  }

  if (!isCreateRoomMapRequest(body)) {
    return NextResponse.json(
      { code: 'validation', message: 'classId, roomId e layoutTemplateId são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const view = await createRoomMap(body)
    return NextResponse.json(view, { status: 201 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
