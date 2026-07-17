/**
 * imagesService — imagens de comunicados via API Gateway.
 *
 * Fluxo presign (#198):
 * 1. `POST /comunicados/api/posts/{postId}/images/presign` (API Gateway)
 * 2. `PUT` na URL assinada — feito no servidor (BFF), não no browser
 */

import type {
  PresignUploadRequest,
  PresignUploadResponse,
  PresignedImageUploadResult,
} from '../types/presign'
import type { AnnouncementFile } from '../types/file'

import type { ApiError, ApiFieldError } from '@portal/shared'

import { comunicadosGatewayPath, resolveApiGatewayUrl } from './comunicadosGateway'

export type ImagesErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'payload-too-large'
  | 'server'
  | 'network'

export class ImagesError extends Error {
  constructor(
    public readonly kind: ImagesErrorKind,
    public readonly status: number,
    public readonly fieldErrors: ApiFieldError[] = [],
    message?: string,
  ) {
    super(message ?? kind)
    this.name = 'ImagesError'
  }
}

function baseUrl(): string {
  try {
    return resolveApiGatewayUrl()
  } catch {
    throw new ImagesError('server', 503, [], 'API_GATEWAY_URL não configurada')
  }
}

async function readApiError(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError
  } catch {
    return undefined
  }
}

async function toImagesError(res: Response): Promise<ImagesError> {
  const apiError = await readApiError(res)
  const fieldErrors = apiError?.errors ?? []
  const message = apiError?.message

  switch (res.status) {
    case 400:
    case 422:
      return new ImagesError('validation', 400, fieldErrors, message)
    case 401:
      return new ImagesError('unauthorized', 401, fieldErrors, message)
    case 403:
      return new ImagesError('forbidden', 403, fieldErrors, message)
    case 413:
      return new ImagesError(
        'payload-too-large',
        413,
        fieldErrors,
        message ?? 'Arquivo maior que 10 MB.',
      )
    default:
      return new ImagesError('server', 502, fieldErrors, message)
  }
}

async function gatewayFetch(
  path: string,
  token: string,
  init: RequestInit,
): Promise<Response> {
  const url = `${baseUrl()}${path}`

  try {
    return await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    })
  } catch (cause) {
    const hint =
      cause instanceof Error && 'cause' in cause && cause.cause instanceof Error
        ? cause.cause.message
        : cause instanceof Error
          ? cause.message
          : undefined
    throw new ImagesError(
      'network',
      503,
      [],
      hint ? `Falha ao conectar em ${url}: ${hint}` : `Falha ao conectar em ${url}`,
    )
  }
}

export async function presignPostImage(
  postId: string,
  body: PresignUploadRequest,
  token: string,
): Promise<PresignUploadResponse> {
  const path = comunicadosGatewayPath(`/api/posts/${postId}/images/presign`)
  const res = await gatewayFetch(path, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (res.status === 201) {
    try {
      return (await res.json()) as PresignUploadResponse
    } catch {
      throw new ImagesError('server', 502)
    }
  }

  throw await toImagesError(res)
}

/** PUT server-side na URL pré-assinada (S3). */
export async function putFileToPresignedUrl(
  file: File | Blob,
  uploadUrl: string,
  contentType: string,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    })
  } catch (cause) {
    const hint = cause instanceof Error ? cause.message : undefined
    throw new ImagesError(
      'network',
      503,
      [],
      hint ? `Falha ao enviar ao armazenamento: ${hint}` : 'Falha ao enviar ao armazenamento.',
    )
  }

  if (!res.ok) {
    throw new ImagesError('server', res.status, [], 'Falha ao enviar imagem ao armazenamento.')
  }
}

export interface UploadPostImageViaPresignOptions {
  thumbnail?: boolean
  filename?: string
}

/**
 * Presign via gateway + upload ao S3 no servidor.
 * O browser envia o arquivo só ao BFF; nenhuma chamada direta ao S3 no client.
 */
export async function uploadPostImageViaPresign(
  postId: string,
  file: File | Blob,
  token: string,
  options: UploadPostImageViaPresignOptions = {},
): Promise<PresignedImageUploadResult> {
  const contentType =
    (file instanceof File && file.type?.trim()) || 'application/octet-stream'
  const originalName =
    options.filename ?? (file instanceof File ? file.name : undefined) ?? 'image'

  const presigned = await presignPostImage(
    postId,
    {
      contentType,
      originalName,
      sizeBytes: file.size,
      thumbnail: options.thumbnail === true,
    },
    token,
  )

  await putFileToPresignedUrl(file, presigned.uploadUrl, contentType)
  return { fileId: presigned.fileId }
}

export interface UploadPostImageOptions {
  thumbnail?: boolean
  filename?: string
}

/** Upload multipart via gateway (alternativa ao presign). */
export async function uploadPostImage(
  postId: string,
  file: File | Blob,
  token: string,
  options: UploadPostImageOptions = {},
): Promise<AnnouncementFile> {
  const thumbnail = options.thumbnail === true
  const path = comunicadosGatewayPath(`/api/posts/${postId}/images`)
  const pathWithQuery = thumbnail ? `${path}?thumbnail=true` : path

  const formData = new FormData()
  const filename = file instanceof File ? file.name : options.filename
  formData.append('file', file, filename ?? 'image')

  const res = await gatewayFetch(pathWithQuery, token, { method: 'POST', body: formData })

  if (res.status === 201) {
    try {
      return (await res.json()) as AnnouncementFile
    } catch {
      throw new ImagesError('server', 502)
    }
  }

  throw await toImagesError(res)
}

/**
 * Remove imagem do post no gateway.
 * Qualquer 2xx = `deleted` (além do 204 típico); 404 = no-op (#398) para sync
 * idempotente — evita falso-negativo se o gateway responder 200 com corpo.
 */
export async function deletePostImage(
  postId: string,
  imageId: string,
  token: string,
): Promise<'deleted' | 'missing'> {
  const path = comunicadosGatewayPath(`/api/posts/${postId}/images/${imageId}`)
  const res = await gatewayFetch(path, token, { method: 'DELETE' })

  if (res.ok) return 'deleted'
  if (res.status === 404) return 'missing'
  throw await toImagesError(res)
}

export const imagesService = {
  presignPostImage,
  putFileToPresignedUrl,
  uploadPostImageViaPresign,
  uploadPostImage,
  deletePostImage,
}
