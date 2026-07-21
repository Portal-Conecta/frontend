import { NextResponse } from 'next/server'

import { listSubmissionWindowsByClass } from '@portal/checklist/services/server/submissionWindowService'

import { bffErrorResponse } from '../../../_lib/bffError'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { classId } = await params
    const data = await listSubmissionWindowsByClass(classId)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}