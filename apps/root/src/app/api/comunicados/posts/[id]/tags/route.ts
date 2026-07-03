import { NextResponse } from 'next/server'

import { getPostTags } from '@portal/comunicados/services/server/postDetailService'

import { httpErrorResponse } from '../../../_lib/httpErrorResponse'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const tags = await getPostTags(id)
    return NextResponse.json(tags)
  } catch (error) {
    return httpErrorResponse(error)
  }
}
