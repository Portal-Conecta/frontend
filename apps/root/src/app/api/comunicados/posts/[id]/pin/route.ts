import { NextResponse } from 'next/server'

import { pinPost } from '@portal/comunicados/services/server/postsService'

import { bffErrorResponse } from '../../../_lib/bffError'

/** BFF — fixa um comunicado no mural, retornando o estado atualizado. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await req.json().catch(() => ({}))) as { pinnedOrder?: number }

  try {
    const data = await pinPost(id, body.pinnedOrder)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
