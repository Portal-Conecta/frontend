import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { createClass, listClasses } from '@portal/core/classes/classesService'
import { parseCreateClass } from '@portal/core/classes/classesValidation'
import type { ClassesListParams } from '@portal/core/classes/types'
import { bffErrorResponse } from '@portal/core/http/bffError'
import { HUB_SHIFT } from '@portal/shared'
import type { HubShift } from '@portal/shared'

const SHIFTS = Object.values(HUB_SHIFT) as string[]

/** BFF — lista turmas com busca (nome) e filtros por curso e turno. */
export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const courseId = searchParams.get('courseId')
  const rawShift = searchParams.get('shift')
  const includeInactive = searchParams.get('includeInactive') === 'true'

  // Turno desconhecido é erro explícito — senão `?shift=FOO` viraria "sem filtro"
  // e devolveria a lista cheia, escondendo o engano do chamador (mesmo critério
  // do `GET /api/courses`).
  if (rawShift && !SHIFTS.includes(rawShift)) {
    return NextResponse.json(
      { code: 'validation', message: `shift deve ser um de: ${SHIFTS.join(', ')}.` },
      { status: 400 },
    )
  }

  const params: ClassesListParams = {}
  if (search) params.search = search
  if (courseId) params.courseId = courseId
  if (rawShift) params.shift = rawShift as HubShift
  if (includeInactive) params.includeInactive = true

  try {
    const data = await listClasses(token, params)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}

/**
 * BFF — cria uma turma. Valida a forma do corpo (curso, número e turno
 * obrigatórios) antes de delegar; regras de negócio (curso inexistente, número
 * duplicado no curso) ficam no backend e sobem via `bffErrorResponse`.
 */
export async function POST(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = parseCreateClass(body)
  if (!parsed.ok) {
    return NextResponse.json(
      { code: 'validation', message: 'Dados inválidos para criação de turma.', errors: parsed.errors },
      { status: 400 },
    )
  }

  try {
    const data = await createClass(parsed.value, token)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
