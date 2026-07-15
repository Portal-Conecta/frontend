import { NextResponse } from 'next/server'

import { findExecutionById } from '@portal/checklist/services/server/executionService'

import { bffErrorResponse } from '../../_lib/bffError'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await findExecutionById(id)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
