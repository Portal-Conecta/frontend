import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import {
  ImagesError,
  presignPostImage,
  type ImagesErrorKind,
} from '@portal/comunicados/services/imagesService'
import type { PresignUploadRequest } from '@portal/comunicados/types/presign'

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
 * BFF de presign (#198).
 * Proxy JSON → gateway `/comunicados/api/posts/{postId}/images/presign`.
 * O browser envia o arquivo com PUT direto ao `uploadUrl` retornado.
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
