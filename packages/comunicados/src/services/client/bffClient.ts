/**
 * Client browser para o BFF (`/api/comunicados/*`). Scaffolding da #184 —
 * `BffError` será unificado com `HttpError` (kind-based) ao subir a camada HTTP
 * para `@portal/core` (ver PR #218).
 */
export class BffError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`BFF error ${status}`)
    this.name = 'BffError'
  }
}

export async function bffFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = undefined
    }
    throw new BffError(res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
