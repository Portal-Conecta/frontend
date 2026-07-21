import { NextResponse } from 'next/server'

import { getPostImages } from '@portal/comunicados/services/server/postsService'
import { validateAnnouncementImageFile } from '@portal/comunicados/utils/announcementImageValidation'

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
 * BFF de anexar imagem (#198 / #398).
 * 1. Valida MIME allowlist + tamanho (`ANNOUNCEMENT_IMAGE_MAX_BYTES`)
 * 2. Presign via API Gateway
 * 3. PUT ao S3 no servidor (browser não acessa S3 nem gateway para o binário)
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
  if (!(file instanceof File)) {
    return NextResponse.json(
      { code: 'validation', message: 'Arquivo de imagem obrigatório.' },
      { status: 400 },
    )
  }

  const validation = validateAnnouncementImageFile(file)
  if (validation) {
    const status = validation.code === 'size' ? 413 : 400
    return NextResponse.json(
      { code: validation.code === 'size' ? 'payload-too-large' : 'validation', message: validation.message },
      { status },
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
