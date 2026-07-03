import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { listPosts } from '@portal/comunicados/services/server'

export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)

  try {
    const params = {
      page: Number(url.searchParams.get('page') ?? 0),
      size: Number(url.searchParams.get('size') ?? 20),
      ...(url.searchParams.get('search') ? { search: url.searchParams.get('search')! } : {}),
      ...(url.searchParams.get('origin') ? { origin: url.searchParams.get('origin') as 'WEG' | 'SENAI' | 'BOTH' } : {}),
      ...(url.searchParams.get('filterType') ? { filterType: url.searchParams.get('filterType')! } : {}),
      ...(url.searchParams.get('classId') ? { classId: url.searchParams.get('classId')! } : {}),
      ...(url.searchParams.get('publishedFrom') ? { publishedFrom: url.searchParams.get('publishedFrom')! } : {}),
      ...(url.searchParams.get('publishedTo') ? { publishedTo: url.searchParams.get('publishedTo')! } : {}),
      ...(url.searchParams.get('tagId') ? { tagId: url.searchParams.get('tagId')! } : {}),
      ...(url.searchParams.getAll('tagIds').length > 0 ? { tagIds: url.searchParams.getAll('tagIds') } : {}),
    }

    const result = await listPosts(params)

    return NextResponse.json(result)
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500
    return NextResponse.json({ code: 'server' }, { status: Number.isFinite(status) && status > 0 ? status : 500 })
  }
}
