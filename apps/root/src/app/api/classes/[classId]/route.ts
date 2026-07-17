import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { getClassDetail } from '@portal/core/classes/classesService'
import { bffErrorResponse } from '@portal/core/http/bffError'

/** BFF — detalhe de uma turma. Proxy de `GET /hub/classes/{classId}`. */
export async function GET(_req: Request, { params }: { params: Promise<{ classId: string }> }) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { classId } = await params

  try {
    const data = await getClassDetail(classId, token)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
