import { NextResponse } from 'next/server'

import { listExecutions } from '@portal/checklist/services/server/executionService'

import { bffErrorResponse } from '../_lib/bffError'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? '0')
    const size = Number(searchParams.get('size') ?? '20')
    const data = await listExecutions(page, size)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
