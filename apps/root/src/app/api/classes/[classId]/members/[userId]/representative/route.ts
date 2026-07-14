import { NextResponse } from 'next/server'

import { setClassRepresentative } from '@portal/core/classes/classMembersService'
import { bffErrorResponse } from '@portal/core/http/bffResponse'

/**
 * BFF — marca/desmarca um aluno como representante da turma (toggle). Corpo
 * `{ representative: boolean }`: `true` promove (backend `PATCH`) e `false`
 * rebaixa (backend `DELETE`) no recurso
 * `/hub/classes/{classId}/members/{userId}/representative`.
 *
 * O limite de 2 representantes é validado no backend — o 400 do promove é
 * repassado ao client (não é feita contagem aqui).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ classId: string; userId: string }> },
) {
  const { classId, userId } = await params
  const body = (await req.json().catch(() => ({}))) as { representative?: unknown }

  if (typeof body.representative !== 'boolean') {
    return NextResponse.json(
      { code: 'validation', message: 'representative (boolean) é obrigatório' },
      { status: 400 },
    )
  }

  try {
    const data = await setClassRepresentative(classId, userId, body.representative)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
