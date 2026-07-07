import { NextResponse } from 'next/server'

import { unpinPost } from '@portal/comunicados/services/server/postsService'

import { bffErrorResponse } from '../../../_lib/bffError'

/** BFF — desafixa um comunicado, retornando o estado atualizado. */
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const data = await unpinPost(id)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
