import { NextResponse } from 'next/server'

import {
  listExecutions,
  type ExecutionListFilters,
} from '@portal/checklist/services/server/executionService'
import type { ChecklistExecutionStatus } from '@portal/checklist/types/execution'
import type { ChecklistType } from '@portal/checklist/types/submissionWindow'

import { bffErrorResponse } from '../_lib/bffError'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? '0')
    const size = Number(searchParams.get('size') ?? '20')

    const filters: ExecutionListFilters = {}
    const classId = searchParams.get('classId')
    const roomId = searchParams.get('roomId')
    const checklistType = searchParams.get('checklistType')
    const status = searchParams.get('status')
    if (classId) filters.classId = classId
    if (roomId) filters.roomId = roomId
    if (checklistType) filters.checklistType = checklistType as ChecklistType
    if (status) filters.status = status as ChecklistExecutionStatus

    const data = await listExecutions(page, size, filters)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
