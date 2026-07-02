import type { ListAnnouncementsResponse, ListPostsParams } from '../../types/posts'

export class PostsClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code = 'posts_client_error',
  ) {
    super(code)
    this.name = 'PostsClientError'
  }
}

function buildQuery(params?: ListPostsParams): string {
  if (!params) return ''

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return

    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => {
      searchParams.append(key, String(item))
    })
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function readErrorCode(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { code?: unknown }
    if (typeof body.code === 'string') return body.code
  } catch {
    // Mantem o fallback quando o BFF responder sem corpo JSON.
  }
  return 'posts_client_error'
}

export async function listPostsClient(params?: ListPostsParams): Promise<ListAnnouncementsResponse> {
  const res = await fetch(`/api/comunicados/posts${buildQuery(params)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new PostsClientError(res.status, await readErrorCode(res))
  }

  return (await res.json()) as ListAnnouncementsResponse
}
