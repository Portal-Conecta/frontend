import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { bffErrorResponse } from '@portal/core/http/bffError'
import { importUsers } from '@portal/core/users/usersImportService'
import type { ExistingEmailHandling } from '@portal/core/users/types'

const VALID_ON_EXISTING = new Set<ExistingEmailHandling>(['REJECT', 'SKIP'])

/** BFF — importa usuários por planilha (#441). Proxy multipart de `POST /hub/imports/users`. */
export async function POST(req: Request) {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'Corpo multipart inválido.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ code: 'validation', message: 'Arquivo (file) é obrigatório.' }, { status: 400 })
  }

  const onExistingRaw = form.get('onExisting')
  const onExisting =
    typeof onExistingRaw === 'string' && VALID_ON_EXISTING.has(onExistingRaw as ExistingEmailHandling)
      ? (onExistingRaw as ExistingEmailHandling)
      : 'REJECT'
  const dryRun = form.get('dryRun') === 'true'
  const filename = file instanceof File ? file.name : 'planilha.csv'

  try {
    return NextResponse.json(await importUsers(file, filename, { onExisting, dryRun }, token))
  } catch (err) {
    return bffErrorResponse(err)
  }
}
