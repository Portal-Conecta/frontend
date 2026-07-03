import { NextResponse } from 'next/server'

import { getPostImages } from '@portal/comunicados/services/server/postDetailService'

import { httpErrorResponse } from '../../../_lib/httpErrorResponse'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const images = await getPostImages(id)
    return NextResponse.json(images)
  } catch (error) {
    return httpErrorResponse(error)
  }
}
