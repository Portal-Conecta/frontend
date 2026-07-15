import type { ApiError } from '@portal/shared'

import { HttpError, mapStatusToKind } from './errors'

async function parseErrorBody(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError
  } catch {
    return undefined
  }
}

/** Fetch tipado para Route Handlers BFF (`/api/...`) no browser — erros via `HttpError`. */
export async function bffFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      ...init,
      // Lista/mutations do BFF não podem reusar cache HTTP do browser — senão o mural
      // volta desatualizado após criar/editar (parece vazio até um hard refresh).
      cache: init?.cache ?? 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch (cause) {
    throw new HttpError('network', undefined, undefined, undefined, { cause })
  }

  if (!res.ok) {
    const body = await parseErrorBody(res)
    throw new HttpError(mapStatusToKind(res.status), res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
