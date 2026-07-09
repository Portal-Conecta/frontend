/**
 * postsService — cria comunicados via API Gateway (`/comunicados/api/posts/*`).
 *
 * Pure server-side logic: no React, no `next/headers`. Called from the BFF
 * Route Handlers (`apps/root/src/app/api/comunicados/posts/*`), which read the
 * JWT from the httpOnly cookie and pass it in as `token`. O gateway valida o
 * Bearer e encaminha ao serviço de comunicados.
 *
 * A base URL vive em `API_GATEWAY_URL` (privada, server-side).
 */

import type {
  AnnouncementResponse,
  PublishAnnouncementRequest,
  ScheduleAnnouncementRequest,
} from '../types'

import type { ApiError, ApiFieldError } from '@portal/shared'

import { comunicadosGatewayPath, resolveApiGatewayUrl } from './comunicadosGateway'


export type PostsErrorKind = 'validation' | 'unauthorized' | 'forbidden' | 'server' | 'network'

export class PostsError extends Error {
  constructor(
    public readonly kind: PostsErrorKind,
    public readonly status: number,
    public readonly fieldErrors: ApiFieldError[] = [],
    message?: string,
  ) {
    super(message ?? kind)
    this.name = 'PostsError'
  }
}

function baseUrl(): string {
  try {
    return resolveApiGatewayUrl()
  } catch {
    throw new PostsError('server', 503, [], 'API_GATEWAY_URL não configurada')
  }
}

async function readApiError(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError
  } catch {
    return undefined
  }
}

async function toPostsError(res: Response): Promise<PostsError> {
  const apiError = await readApiError(res)
  const fieldErrors = apiError?.errors ?? []
  const message = apiError?.message

  switch (res.status) {
    case 400:
    case 422:
      return new PostsError('validation', 400, fieldErrors, message)
    case 401:
      return new PostsError('unauthorized', 401, fieldErrors, message)
    case 403:
      return new PostsError('forbidden', 403, fieldErrors, message)
    default:
      return new PostsError('server', 502, fieldErrors, message)
  }
}

async function createPost(
  path: string,
  body: PublishAnnouncementRequest | ScheduleAnnouncementRequest,
  token: string,
): Promise<AnnouncementResponse> {
  const url = `${baseUrl()}${comunicadosGatewayPath(path)}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  } catch (cause) {
    const hint =
      cause instanceof Error && 'cause' in cause && cause.cause instanceof Error
        ? cause.cause.message
        : cause instanceof Error
          ? cause.message
          : undefined
    throw new PostsError(
      'network',
      503,
      [],
      hint ? `Falha ao conectar em ${url}: ${hint}` : `Falha ao conectar em ${url}`,
    )
  }

  if (res.status === 201) {
    try {
      return (await res.json()) as AnnouncementResponse
    } catch {
      throw new PostsError('server', 502)
    }
  }

  throw await toPostsError(res)
}

export function publishPost(
  body: PublishAnnouncementRequest,
  token: string,
): Promise<AnnouncementResponse> {
  return createPost('/api/posts/publish', body, token)
}

export function schedulePost(
  body: ScheduleAnnouncementRequest,
  token: string,
): Promise<AnnouncementResponse> {
  return createPost('/api/posts/schedule', body, token)
}

export const postsService = {
  publishPost,
  schedulePost,
}
