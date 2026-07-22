import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import {
  ImagesError,
  presignPostImage,
  type ImagesErrorKind,
} from '@portal/comunicados/services/imagesService'
import type { PresignUploadRequest } from '@portal/comunicados/types/presign'
import { validateAnnouncementImagePresign } from '@portal/comunicados/utils/announcementImageValidation'

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
 * BFF de presign (#198 / #398).
 *
 * Proxy JSON → gateway `/comunicados/api/posts/{postId}/images/presign`.
 *
 * **Uso atual:** o wizard de create/edit **não** chama esta rota — o upload
 * passa por `POST …/images` (presign + PUT S3 no servidor). Mantida para
 * clientes/tooling que ainda peçam URL assinada; conteúdo e tamanho são
 * validados aqui antes do proxy. Preferir o POST multipart quando possível.
 */
export async function POST(req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  let body: PresignUploadRequest
  try {
    body = (await req.json()) as PresignUploadRequest
  } catch {
    return NextResponse.json({ code: 'validation', message: 'Corpo inválido.' }, { status: 400 })
  }

  if (!body.contentType?.trim() || !body.originalName?.trim()) {
    return NextResponse.json(
      { code: 'validation', message: 'contentType e originalName são obrigatórios.' },
      { status: 400 },
    )
  }

  const validation = validateAnnouncementImagePresign({
    contentType: body.contentType,
    ...(body.sizeBytes != null ? { sizeBytes: body.sizeBytes } : {}),
  })
  if (validation) {
    const status = validation.code === 'size' ? 413 : 400
    return NextResponse.json(
      { code: validation.code === 'size' ? 'payload-too-large' : 'validation', message: validation.message },
      { status },
    )
  }

  try {
    const presigned = await presignPostImage(id, body, token)
    return NextResponse.json(presigned, { status: 201 })
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
