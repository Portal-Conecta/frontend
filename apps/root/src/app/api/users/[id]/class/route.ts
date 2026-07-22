import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { bffErrorResponse } from '@portal/core/http/bffError'
import { getUserActiveClassId } from '@portal/core/users/loadUserClassCard'

interface RouteContext {
  params: Promise<{ id: string }>
}

/** BFF — UUID da turma ativa do usuário (`GET /hub/users/{id}/class`). */
export async function GET(_req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  const { id } = await context.params
  const userId = id?.trim()
  if (!userId) {
    return NextResponse.json({ code: 'validation', message: 'id obrigatório.' }, { status: 400 })
  }

  try {
    const classId = await getUserActiveClassId(userId, token)
    if (!classId) {
      return NextResponse.json(
        { code: 'not_found', message: 'Turma ativa não encontrada para este usuário.' },
        { status: 404 },
      )
    }
    return NextResponse.json(classId)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
