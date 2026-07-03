import { NextResponse } from 'next/server'

import { getPost } from '@portal/comunicados/services/server/postDetailService'

import { httpErrorResponse } from '../../_lib/httpErrorResponse'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const post = await getPost(id)
    return NextResponse.json(post)
  } catch (error) {
    return httpErrorResponse(error)
  }
}
