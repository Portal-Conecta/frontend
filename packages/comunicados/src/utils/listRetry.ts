import { HttpError } from '@portal/core/http/errors'

/**
 * Retry curto para listagens do mural/meus (#326).
 *
 * O gateway/comunicados-backend às vezes responde 5xx ou falha de rede logo após
 * publish/schedule + upload de imagens — a listagem que roda no soft-nav de
 * volta ao mural cai nesse buraco. Hard refresh funciona porque o back já
 * estabilizou. Erros de auth/validação não retentam.
 */
export const LIST_RETRY_ATTEMPTS = 5
export const LIST_RETRY_BASE_DELAY_MS = 400

export function isRetryableListError(error: unknown): boolean {
  return error instanceof HttpError && (error.kind === 'server' || error.kind === 'network')
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** Executa `load` com backoff linear em erros retryable. */
export async function withListRetry<T>(load: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= LIST_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await load()
    } catch (error) {
      lastError = error
      if (!isRetryableListError(error) || attempt === LIST_RETRY_ATTEMPTS) {
        throw error
      }
      await wait(LIST_RETRY_BASE_DELAY_MS * attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('posts_list_error')
}
