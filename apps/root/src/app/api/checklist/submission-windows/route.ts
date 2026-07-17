import { NextResponse } from 'next/server'

import { listSubmissionWindows } from '@portal/checklist/services/server/submissionWindowService' 

import { bffErrorResponse } from '../_lib/bffError' 

export async function GET() {
  try {
    const data = await listSubmissionWindows()
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}