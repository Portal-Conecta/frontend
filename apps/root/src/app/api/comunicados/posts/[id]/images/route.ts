import { NextResponse } from 'next/server'

import { getPostImages } from '@portal/comunicados/services/server/postsService'

import { bffErrorResponse } from '../../../_lib/bffError'

/** BFF — imagens anexadas de um post. Delega ao service server (JWT do cookie httpOnly). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const images = await getPostImages(id)
    return NextResponse.json(images)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
