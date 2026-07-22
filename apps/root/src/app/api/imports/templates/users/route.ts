import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { bffErrorResponse } from '@portal/core/http/bffError'
import { getUserImportTemplate } from '@portal/core/users/usersImportService'

/** BFF — baixa o modelo (CSV) de importação de usuários (#441). */
export async function GET() {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  try {
    const blob = await getUserImportTemplate(token)
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="import-users-template.csv"',
      },
    })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
