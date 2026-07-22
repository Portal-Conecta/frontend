/**
 * Client-side de importação de usuários por planilha (#441). Fora do
 * `bffFetch` genérico: ele força `Content-Type: application/json`, o que
 * quebraria o boundary do `multipart/form-data` (o browser precisa gerar esse
 * header sozinho a partir do `FormData`).
 */
import type { ApiError } from '@portal/shared'

import { HttpError, mapStatusToKind } from '../http/errors'
import type { ExistingEmailHandling, UserImportResult } from './types'

async function parseErrorBody(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError
  } catch {
    return undefined
  }
}

export interface ImportUsersClientOptions {
  onExisting: ExistingEmailHandling
  dryRun: boolean
}

export async function importUsersClient(
  file: File,
  options: ImportUsersClientOptions,
): Promise<UserImportResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('onExisting', options.onExisting)
  form.append('dryRun', String(options.dryRun))

  let res: Response
  try {
    res = await fetch('/api/imports/users', { method: 'POST', body: form, cache: 'no-store' })
  } catch (cause) {
    throw new HttpError('network', undefined, undefined, undefined, { cause })
  }

  if (!res.ok) {
    throw new HttpError(mapStatusToKind(res.status), res.status, await parseErrorBody(res))
  }
  return res.json() as Promise<UserImportResult>
}

/** URL do modelo (CSV) de importação — usado direto num `<a href>`, sem fetch. */
export const USER_IMPORT_TEMPLATE_URL = '/api/imports/templates/users'
