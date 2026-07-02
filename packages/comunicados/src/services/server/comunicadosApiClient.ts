import type { ListPostsParams } from '../../types/posts'

interface GetOptions {
  params?: ListPostsParams
  token: string
}

export class ComunicadosApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code = 'comunicados_api_error',
  ) {
    super(code)
    this.name = 'ComunicadosApiError'
  }
}

function baseUrl(): string {
  const url = process.env.COMUNICADOS_API_URL ?? process.env.API_URL
  if (!url) {
    throw new ComunicadosApiError(503, 'missing_comunicados_api_url')
  }
  return url
}

function appendParams(url: URL, params?: ListPostsParams): void {
  if (!params) return

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return

    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => {
      url.searchParams.append(key, String(item))
    })
  })
}

async function readErrorCode(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { code?: unknown; message?: unknown }
    if (typeof body.code === 'string') return body.code
    if (typeof body.message === 'string') return body.message
  } catch {
    // Respostas de erro sem JSON continuam mapeadas pelo status HTTP.
  }
  return 'comunicados_api_error'
}

export const comunicadosApiClient = {
  async get<T>(path: string, { params, token }: GetOptions): Promise<T> {
    const url = new URL(path, baseUrl())
    appendParams(url, params)

    let res: Response
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })
    } catch {
      throw new ComunicadosApiError(503, 'network')
    }

    if (!res.ok) {
      throw new ComunicadosApiError(res.status, await readErrorCode(res))
    }

    return (await res.json()) as T
  },
}
