import { NextResponse } from 'next/server'

import { removeClassMember } from '@portal/core/classes/classMembersService'
import { bffErrorResponse } from '@portal/core/http/bffError'

/**
 * BFF — desvincula um usuário da turma. Proxy de
 * `DELETE /hub/classes/{classId}/members/{userId}`. 204 sem corpo. O backend
 * bloqueia remover o próprio vínculo (400) e vínculo inexistente (404).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ classId: string; userId: string }> },
) {
  const { classId, userId } = await params

  try {
    await removeClassMember(classId, userId)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
