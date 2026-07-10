import { NextResponse } from 'next/server'

import { getPostImages } from '@portal/comunicados/services/server/postsService'

import { bffErrorResponse } from '../../../_lib/bffError'

import { getSession } from '@portal/core/auth/session'
import {
  ImagesError,
  uploadPostImageViaPresign,
  type ImagesErrorKind,
} from '@portal/comunicados/services/imagesService'


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

const STATUS_BY_KIND: Record<ImagesErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  'payload-too-large': 413,
  server: 503,
  network: 503,
}

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * BFF de anexar imagem (#198).
 * 1. Presign via API Gateway
 * 2. PUT ao S3 no servidor (browser não acessa S3 nem gateway para o binário)
 */
export async function POST(req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const thumbnail = new URL(req.url).searchParams.get('thumbnail') === 'true'

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'Corpo inválido.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { code: 'validation', message: 'Arquivo de imagem obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const result = await uploadPostImageViaPresign(id, file, token, {
      thumbnail,
      filename: file.name,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof ImagesError) {
      return NextResponse.json(
        { code: err.kind, message: err.message, errors: err.fieldErrors },
        { status: STATUS_BY_KIND[err.kind] },
      )
    }
    return NextResponse.json({ code: 'server' }, { status: 503 })
  }
}
