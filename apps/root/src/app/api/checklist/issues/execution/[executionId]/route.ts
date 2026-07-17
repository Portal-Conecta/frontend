import { NextResponse } from 'next/server'

import { listIssuesByExecution } from '@portal/checklist/services/server/issueService'

import { bffErrorResponse } from '../../../_lib/bffError'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ executionId: string }> },
) {
  try {
    const { executionId } = await params
    const data = await listIssuesByExecution(executionId)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}