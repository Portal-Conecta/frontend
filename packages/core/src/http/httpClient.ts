import type { ApiError } from '@portal/shared'

import { getSession } from '../auth/session'
import { HttpError, mapStatusToKind } from './errors'
import { buildQuery, type QueryParams } from './query'

export type { QueryParamValue, QueryParams } from './query'

export interface HttpRequestOptions {
  params?: QueryParams
  body?: unknown
  cache?: RequestCache
  /** Sobrescreve o token da sessão (ex.: testes). Omitir para resolver via getSession(). */
  token?: string
  /**
   * Opt-in ao Data Cache do Next (só Server Components/Route Handlers — fetch no
   * browser ignora isso). Mutuamente exclusivo com `cache`: o Next rejeita `cache`
   * junto de `next.revalidate` na mesma call, então os dois ficam em branches
   * separados em `request()` (#406).
   */
  next?: { revalidate: number; tags?: string[] }
}

function baseUrl(baseUrlEnv: string): string {
  const url = process.env[baseUrlEnv]
  if (!url) {
    throw new HttpError('server', undefined, undefined, `${baseUrlEnv} não configurada`)
  }
  return url.replace(/\/$/, '')
}

function authHeaders(accessToken: string, extra?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  }
}

async function parseErrorBody(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError
  } catch {
    return undefined
  }
}

export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>
  post<T>(path: string, options?: HttpRequestOptions): Promise<T>
  put<T>(path: string, options?: HttpRequestOptions): Promise<T>
  patch<T>(path: string, options?: HttpRequestOptions): Promise<T>
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>
}

export function createHttpClient(baseUrlEnv: string): HttpClient {
  async function resolveToken(explicit?: string): Promise<string> {
    if (explicit) return explicit
    const token = await getSession()
    if (!token) throw new HttpError('unauthorized')
    return token
  }

  async function request<T>(
    method: string,
    path: string,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    const token = await resolveToken(options.token)
    const url = `${baseUrl(baseUrlEnv)}${path}${buildQuery(options.params)}`

    let res: Response
    try {
      const init: RequestInit = {
        method,
        headers: authHeaders(token),
        ...(options.next ? { next: options.next } : { cache: options.cache ?? 'no-store' }),
      }
      if (options.body !== undefined) {
        init.body = JSON.stringify(options.body)
      }
      res = await fetch(url, init)
    } catch (cause) {
      throw new HttpError('network', undefined, undefined, undefined, { cause })
    }

    if (res.ok) {
      if (res.status === 204) return undefined as T
      try {
        return (await res.json()) as T
      } catch {
        throw new HttpError('server', res.status)
      }
    }

    const body = await parseErrorBody(res)
    throw new HttpError(mapStatusToKind(res.status), res.status, body)
  }

  return {
    get<T>(path: string, options?: HttpRequestOptions) {
      return request<T>('GET', path, options)
    },
    post<T>(path: string, options?: HttpRequestOptions) {
      return request<T>('POST', path, options)
    },
    put<T>(path: string, options?: HttpRequestOptions) {
      return request<T>('PUT', path, options)
    },
    patch<T>(path: string, options?: HttpRequestOptions) {
      return request<T>('PATCH', path, options)
    },
    delete<T>(path: string, options?: HttpRequestOptions) {
      return request<T>('DELETE', path, options)
    },
  }
}
