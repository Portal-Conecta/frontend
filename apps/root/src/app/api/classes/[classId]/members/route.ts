import { NextResponse } from 'next/server'

import { addClassMember } from '@portal/core/classes/classMembersService'
import type { AddMemberRequest } from '@portal/core/classes/types'
import { bffErrorResponse } from '@portal/core/http/bffResponse'
import type { ClassRole } from '@portal/core/rbac'

const CLASS_ROLES = new Set<ClassRole>(['STUDENT', 'TEACHER', 'REPRESENTATIVE'])

/**
 * BFF — vincula um usuário a uma turma com um papel. Proxy de
 * `POST /hub/classes/{classId}/members`. Valida a forma do corpo antes de
 * delegar; regras de negócio (vínculo duplicado, turma/usuário inexistentes)
 * ficam no backend e sobem via `bffErrorResponse`.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params
  const body = (await req.json().catch(() => ({}))) as Partial<AddMemberRequest>

  if (!body.userId || !body.classRole || !CLASS_ROLES.has(body.classRole)) {
    return NextResponse.json(
      {
        code: 'validation',
        message: 'userId e classRole (STUDENT | TEACHER | REPRESENTATIVE) são obrigatórios',
      },
      { status: 400 },
    )
  }

  try {
    const data = await addClassMember(classId, {
      userId: body.userId,
      classRole: body.classRole,
    })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
