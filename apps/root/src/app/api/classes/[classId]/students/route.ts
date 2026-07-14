import { NextResponse } from 'next/server'

import { listClassStudents } from '@portal/core/classes/classMembersService'
import { bffErrorResponse } from '@portal/core/http/bffResponse'

/**
 * BFF — lista aprendizes (e representantes) de uma turma. Proxy de
 * `GET /hub/classes/{classId}/students`. Não inclui docentes: o core não expõe
 * listagem de professores por turma.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params

  try {
    return NextResponse.json(await listClassStudents(classId))
  } catch (err) {
    return bffErrorResponse(err)
  }
}
