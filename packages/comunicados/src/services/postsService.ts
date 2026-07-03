/**
 * postsService — talks to the comunicados backend to create announcements.
 *
 * Pure server-side logic: no React, no `next/headers`. Called from the BFF
 * Route Handlers (`apps/root/src/app/api/comunicados/posts/*`), which read the
 * JWT from the httpOnly cookie and pass it in as `token`. The token never
 * reaches the browser JS.
 *
 * The base URL lives in `COMUNICADOS_API_URL` (private, server-side). Errors are
 * surfaced as a typed `PostsError` carrying the HTTP status and, for validation
 * failures, the per-field details so the caller can map them back to the form.
 */

import type {
  AnnouncementResponse,
  PublishAnnouncementRequest,
  ScheduleAnnouncementRequest,
} from '../types/announcement'

import type { ApiError, ApiFieldError } from '../../../shared/src/types/api-error'


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
  const url = process.env.COMUNICADOS_API_URL
  if (!url) {
    throw new PostsError('server', 503, [], 'COMUNICADOS_API_URL não configurada')
  }
  return url
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

async function createAnnouncement(
  path: string,
  body: PublishAnnouncementRequest | ScheduleAnnouncementRequest,
  token: string,
): Promise<AnnouncementResponse> {
  const url = `${baseUrl()}${path}`

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
  } catch {
    throw new PostsError('network', 503)
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
  return createAnnouncement('/api/posts/publish', body, token)
}

export function schedulePost(
  body: ScheduleAnnouncementRequest,
  token: string,
): Promise<AnnouncementResponse> {
  return createAnnouncement('/api/posts/schedule', body, token)
}

export const postsService = {
  publishPost,
  schedulePost,
}
