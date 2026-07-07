import { NextResponse } from 'next/server'

import { getPostTags } from '@portal/comunicados/services/server/postsService'

import { bffErrorResponse } from '../../../_lib/bffError'

/** BFF — tags de um post. Delega ao service server (JWT do cookie httpOnly). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const tags = await getPostTags(id)
    return NextResponse.json(tags)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
