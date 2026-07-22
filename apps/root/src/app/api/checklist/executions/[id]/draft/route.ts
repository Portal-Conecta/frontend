import { NextResponse } from 'next/server'

import { saveDraftAnswers } from '@portal/checklist/services/server/executionService'

import { bffErrorResponse } from '../../../_lib/bffError'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = await saveDraftAnswers(id, body)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
