import { NextResponse } from 'next/server'

import { listPosts } from '@portal/comunicados/services/server/postsService'
import type { QueryParams } from '@portal/core/http/query'

import { bffErrorResponse } from '../_lib/bffError'

/**
 * BFF — lista o mural. Repassa a query da URL como veio (paginação/filtros),
 * preservando chaves repetidas (ex.: `tagIds`), e delega ao service server.
 */
function queryFromUrl(url: string): QueryParams {
  const params: QueryParams = {}
  for (const [key, value] of new URL(url).searchParams) {
    const current = params[key]
    if (current === undefined) params[key] = value
    else if (Array.isArray(current)) current.push(value)
    else params[key] = [current as string, value]
  }
  return params
}

export async function GET(req: Request) {
  try {
    const data = await listPosts(queryFromUrl(req.url))
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
