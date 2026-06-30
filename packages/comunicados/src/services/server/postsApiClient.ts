import type { ApiError } from '../../types'

import { ComunicadosApiError, type ComunicadosApiErrorKind } from '../errors'
import { buildQuery, type QueryParams } from '../query'

export type { QueryParamValue, QueryParams } from '../query'

function baseUrl(): string {
  const url = process.env.COMUNICADOS_API_URL
  if (!url) {
    throw new ComunicadosApiError('server', undefined, undefined, 'COMUNICADOS_API_URL não configurada')
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

function mapStatusToKind(status: number): ComunicadosApiErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 400 || status === 422) return 'validation'
  return 'server'
}

async function parseErrorBody(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError
  } catch {
    return undefined
  }
}

async function request<T>(
  method: string,
  path: string,
  options: { token: string; params?: QueryParams; body?: unknown; cache?: RequestCache },
): Promise<T> {
  const url = `${baseUrl()}${path}${buildQuery(options.params)}`

  let res: Response
  try {
    const init: RequestInit = {
      method,
      headers: authHeaders(options.token),
      cache: options.cache ?? 'no-store',
    }
    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body)
    }
    res = await fetch(url, init)
  } catch (cause) {
    throw new ComunicadosApiError('network', undefined, undefined, undefined, { cause })
  }

  if (res.ok) {
    if (res.status === 204) return undefined as T
    try {
      return (await res.json()) as T
    } catch {
      throw new ComunicadosApiError('server', res.status)
    }
  }

  const body = await parseErrorBody(res)
  throw new ComunicadosApiError(mapStatusToKind(res.status), res.status, body)
}

export const postsApiClient = {
  get<T>(path: string, options: { token: string; params?: QueryParams; cache?: RequestCache }) {
    return request<T>('GET', path, options)
  },
  post<T>(path: string, options: { token: string; body?: unknown; params?: QueryParams }) {
    return request<T>('POST', path, options)
  },
  put<T>(path: string, options: { token: string; body?: unknown; params?: QueryParams }) {
    return request<T>('PUT', path, options)
  },
  patch<T>(path: string, options: { token: string; body?: unknown; params?: QueryParams }) {
    return request<T>('PATCH', path, options)
  },
  delete<T>(path: string, options: { token: string; params?: QueryParams }) {
    return request<T>('DELETE', path, options)
  },
}
