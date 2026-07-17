import { NextResponse } from 'next/server'

import { upsertSubmissionWindow } from '@portal/checklist/services/server/submissionWindowService' 

import { bffErrorResponse } from '../../../../_lib/bffError'
import type { ChecklistType } from '@portal/checklist/types/submissionWindow' 

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ classId: string; checklistType: string }> },
) {
  try {
    const { classId, checklistType } = await params
    const body = await req.json()
    const data = await upsertSubmissionWindow(classId, checklistType as ChecklistType, body)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}