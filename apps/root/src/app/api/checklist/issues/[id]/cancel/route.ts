import { NextResponse } from 'next/server'

import { cancelIssue } from '@portal/checklist/services/server/issueService'

import { bffErrorResponse } from '../../../_lib/bffError'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await cancelIssue(id)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}