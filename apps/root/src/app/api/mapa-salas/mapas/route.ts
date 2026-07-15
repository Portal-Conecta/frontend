import { NextResponse } from 'next/server'

import { createRoomMap, listRoomMaps } from '@portal/mapa-salas/services/server/roomMapService'
import type {
  CreateRoomMapInitialAllocationRequest,
  CreateRoomMapRequest,
} from '@portal/mapa-salas/types'

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

/** String não vazia após `trim()` — rejeita `''` e strings só com espaço. */
function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** Shape de uma alocação inicial (`locations[]`): studentId obrigatório, resto opcional. */
function isCreateRoomMapInitialAllocation(
  value: unknown,
): value is CreateRoomMapInitialAllocationRequest {
  if (typeof value !== 'object' || value === null) return false
  const { studentId, seatNumber, layoutPositionId } = value as Record<string, unknown>
  return (
    isNonBlankString(studentId) &&
    (seatNumber === undefined || seatNumber === null || typeof seatNumber === 'number') &&
    (layoutPositionId === undefined || layoutPositionId === null || typeof layoutPositionId === 'string')
  )
}

/**
 * Valida o body de criação (tipos de #286) e monta o payload explícito que
 * segue para o back — nunca repassa o objeto cru, então chaves inventadas no
 * request não sobrevivem (evita mass-assignment).
 */
function parseCreateRoomMapRequest(body: unknown): CreateRoomMapRequest | null {
  if (typeof body !== 'object' || body === null) return null

  const { classId, roomId, layoutTemplateId, locations } = body as Record<string, unknown>
  if (![classId, roomId, layoutTemplateId].every(isNonBlankString)) return null
  if (locations !== undefined && (!Array.isArray(locations) || !locations.every(isCreateRoomMapInitialAllocation))) {
    return null
  }

  return {
    classId: (classId as string).trim(),
    roomId: (roomId as string).trim(),
    layoutTemplateId: (layoutTemplateId as string).trim(),
    ...(locations !== undefined ? { locations: locations as CreateRoomMapInitialAllocationRequest[] } : {}),
  }
}

/**
 * BFF — cria o mapa de sala de uma turma. Delega ao service server (JWT do
 * cookie httpOnly) e responde 201 com a view criada. A permissão é do back
 * (role TEACHER): o 403 dele segue como `forbidden` via `bffErrorResponse`,
 * junto com os demais erros (401/400 com `errors[]` por campo).
 */
export async function POST(req: Request) {
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'Corpo inválido.' }, { status: 400 })
  }

  const body = parseCreateRoomMapRequest(rawBody)
  if (!body) {
    return NextResponse.json(
      {
        code: 'validation',
        message:
          'classId, roomId e layoutTemplateId são obrigatórios; locations, se presente, deve ser uma lista de alocações válidas.',
      },
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
