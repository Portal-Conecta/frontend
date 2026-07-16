import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import {
  deletePostImage,
  ImagesError,
  type ImagesErrorKind,
} from '@portal/comunicados/services/imagesService'

import { bffErrorResponse } from '../../../../_lib/bffError'

const STATUS_BY_KIND: Record<ImagesErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  'payload-too-large': 413,
  server: 503,
  network: 503,
}

interface RouteContext {
  params: Promise<{ id: string; imageId: string }>
}

/**
 * BFF — remove imagem de um post (`DELETE /api/posts/{postId}/images/{imageId}`).
 * Delega ao gateway com o JWT do cookie httpOnly.
 */
export async function DELETE(_req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id, imageId } = await context.params

  try {
    await deletePostImage(id, imageId, token)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof ImagesError) {
      return NextResponse.json(
        { code: err.kind, message: err.message, errors: err.fieldErrors },
        { status: STATUS_BY_KIND[err.kind] },
      )
    }
    return bffErrorResponse(err)
  }
}
