import { NextResponse } from 'next/server'

import { createDraft } from '@portal/checklist/services/server/executionService'

import { bffErrorResponse } from '../../_lib/bffError'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = await createDraft(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}
