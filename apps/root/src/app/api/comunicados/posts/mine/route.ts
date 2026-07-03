import { NextResponse } from 'next/server'

import { listMyAnnouncements } from '@portal/comunicados/services/server/announcementsService'

import { bffErrorResponse } from '../../_lib/bffError'

/**
 * BFF — lista os comunicados do próprio autor. Repassa a query da URL como veio
 * (paginação/filtros) e delega ao service server, que resolve o JWT do cookie
 * httpOnly e chama o back. O token nunca trafega no JS do browser.
 *
 * `Object.fromEntries` colapsa chaves repetidas no último valor — ok para os
 * filtros single-value de "Meus Comunicados".
 */
export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams)

  try {
    const data = await listMyAnnouncements(params)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
