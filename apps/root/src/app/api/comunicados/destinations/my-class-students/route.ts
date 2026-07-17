import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import { listMyClassStudents } from '@portal/core/classes/classMembersService'
import { parseUserFromToken } from '@portal/core/rbac'

/**
 * BFF — alunos das turmas do usuário autenticado (RN-COM-PA02/PA03).
 *
 * Docente e representante não enxergam o diretório completo
 * (`/destinations/users`): o público deles são os alunos das próprias turmas.
 * Uma chamada ao Core (`GET /hub/me/classes/students`), escopo do JWT — sem
 * fan-out em `/classes/{id}/members`.
 *
 * "Aluno da turma" = STUDENT ou REPRESENTATIVE; o próprio usuário fica de fora.
 * `listMyClassStudents` já filtra TEACHER e contas inativas de forma defensiva.
 */
export async function GET() {
  const token = await getSession()
  const user = parseUserFromToken(token)
  if (!token || !user) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  try {
    const members = await listMyClassStudents(token)

    const students = members
      .filter((member) => member.id !== user.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

    return NextResponse.json({ students })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json(
        { code: err.kind, message: err.message },
        { status: err.status ?? 503 },
      )
    }
    return NextResponse.json({ code: 'server' }, { status: 503 })
  }
}
