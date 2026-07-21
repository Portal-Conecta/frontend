/**
 * Importação de usuários por planilha (#441) — `POST /hub/imports/users`
 * (multipart) e `GET /hub/imports/templates/users`. Fora do `createHttpClient`
 * genérico (JSON-only): aqui o corpo é `FormData`/binário, não `JSON.stringify`.
 */
import type { ApiError } from '@portal/shared'

import { HttpError, mapStatusToKind } from '../http/errors'
import { hubGatewayPath } from '../http/hubGateway'
import type { ExistingEmailHandling, UserImportResult } from './types'

function baseUrl(): string {
  const url = process.env.API_GATEWAY_URL
  if (!url) {
    throw new HttpError('server', undefined, undefined, 'API_GATEWAY_URL não configurada')
  }
  return url.replace(/\/$/, '')
}

async function parseErrorBody(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError
  } catch {
    return undefined
  }
}

export interface ImportUsersOptions {
  onExisting: ExistingEmailHandling
  dryRun: boolean
}

/** Importa usuários de uma planilha (CSV/XLSX) — colunas `name,email` (`type_user` opcional, inferido pelo domínio do e-mail). */
export async function importUsers(
  file: Blob,
  filename: string,
  options: ImportUsersOptions,
  token: string,
): Promise<UserImportResult> {
  const form = new FormData()
  form.append('file', file, filename)

  const params = new URLSearchParams({
    onExisting: options.onExisting,
    dryRun: String(options.dryRun),
  })

  let res: Response
  try {
    res = await fetch(`${baseUrl()}${hubGatewayPath('/imports/users')}?${params.toString()}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: 'no-store',
    })
  } catch (cause) {
    throw new HttpError('network', undefined, undefined, undefined, { cause })
  }

  if (!res.ok) {
    throw new HttpError(mapStatusToKind(res.status), res.status, await parseErrorBody(res))
  }
  return res.json() as Promise<UserImportResult>
}

/** Baixa o modelo (CSV) de importação de usuários. */
export async function getUserImportTemplate(token: string): Promise<Blob> {
  let res: Response
  try {
    res = await fetch(`${baseUrl()}${hubGatewayPath('/imports/templates/users')}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
  } catch (cause) {
    throw new HttpError('network', undefined, undefined, undefined, { cause })
  }

  if (!res.ok) {
    throw new HttpError(mapStatusToKind(res.status), res.status, await parseErrorBody(res))
  }
  return res.blob()
}
