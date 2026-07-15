import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { getCourseDetail, updateCourse } from '@portal/core/courses/coursesService'
import { parseUpdateCourse } from '@portal/core/courses/coursesValidation'

import { bffErrorResponse } from '../_lib/bffError'

/** BFF — detalhe de um curso, incluindo turmas ativas e inativas. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const data = await getCourseDetail(id, token)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}

/** BFF — edita código e/ou nome de um curso. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = parseUpdateCourse(body)
  if (!parsed.ok) {
    return NextResponse.json(
      { code: 'validation', message: 'Dados inválidos para edição de curso.', errors: parsed.errors },
      { status: 400 },
    )
  }

  try {
    const data = await updateCourse(id, parsed.value, token)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
