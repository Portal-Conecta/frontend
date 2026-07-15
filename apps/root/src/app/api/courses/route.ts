import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { createCourses, listCourses } from '@portal/core/courses/coursesService'
import type { CoursesListParams } from '@portal/core/courses/types'
import { parseCreateCourseBatch } from '@portal/core/courses/coursesValidation'
import { HUB_SHIFT } from '@portal/shared'
import type { HubShift } from '@portal/shared'

import { bffErrorResponse } from './_lib/bffError'

const SHIFTS = Object.values(HUB_SHIFT) as string[]

/** BFF — lista cursos com busca (nome/código) e filtro por turno. */
export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const rawShift = searchParams.get('shift')

  // Turno desconhecido é erro explícito — senão `?shift=FOO` viraria "sem filtro"
  // e devolveria a lista cheia, escondendo o engano do chamador.
  if (rawShift && !SHIFTS.includes(rawShift)) {
    return NextResponse.json(
      { code: 'validation', message: `shift deve ser um de: ${SHIFTS.join(', ')}.` },
      { status: 400 },
    )
  }

  const params: CoursesListParams = {}
  if (search) params.search = search
  if (rawShift) params.shift = rawShift as HubShift

  try {
    const data = await listCourses(token, params)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}

/**
 * BFF — cria cursos em lote. Valida todos os itens antes de enviar qualquer um:
 * item estruturalmente inválido → 400 com erros por índice, nada é criado.
 * Passando a validação, retorna 201 se todos foram criados ou 207 (parcial).
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

  const parsed = parseCreateCourseBatch(body)
  if (!parsed.ok) {
    return NextResponse.json(
      { code: 'validation', message: 'Dados inválidos para criação de curso.', errors: parsed.errors },
      { status: 400 },
    )
  }

  try {
    const result = await createCourses(parsed.values, token)
    return NextResponse.json(result, { status: result.errorCount === 0 ? 201 : 207 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
