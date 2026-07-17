import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import { listClassMembers } from '@portal/core/classes/classMembersService'
import { parseUserFromToken } from '@portal/core/rbac'
import type { ClassMember } from '@portal/core/classes/types'

/**
 * BFF — alunos das turmas do usuário autenticado (RN-COM-PA02/PA03).
 *
 * Docente e representante não enxergam o diretório completo
 * (`/destinations/users`): o público deles são os alunos das próprias turmas.
 * As turmas vêm dos claims `classes` do JWT (nunca de parâmetro do client, para
 * o usuário não expandir o próprio escopo) e os membros de cada turma vêm do
 * core (`GET /hub/classes/{id}/members`), com fan-out + dedupe por usuário.
 *
 * "Aluno da turma" = membro com papel STUDENT ou REPRESENTATIVE (representante
 * também é aluno); TEACHER e o próprio usuário ficam de fora.
 */
export async function GET() {
  const token = await getSession()
  const user = parseUserFromToken(token)
  if (!token || !user) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const classIds = [...new Set(user.classes.map((membership) => membership.classId))]
  if (classIds.length === 0) {
    return NextResponse.json({ students: [] })
  }

  try {
    const membersPerClass = await Promise.all(
      classIds.map((classId) => listClassMembers(classId, undefined, token)),
    )

    const byId = new Map<string, ClassMember>()
    for (const members of membersPerClass) {
      for (const member of members) {
        if (member.role === 'TEACHER') continue
        if (member.id === user.id) continue
        if (!byId.has(member.id)) byId.set(member.id, member)
      }
    }

    const students = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
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
