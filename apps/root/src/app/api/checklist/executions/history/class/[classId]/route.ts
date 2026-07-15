import { NextResponse } from 'next/server'

import { listExecutionHistoryByClass } from '@portal/checklist/services/server/executionService'

import { bffErrorResponse } from '../../../../_lib/bffError'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { classId } = await params
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? '0')
    const size = Number(searchParams.get('size') ?? '20')
    const data = await listExecutionHistoryByClass(classId, page, size)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
