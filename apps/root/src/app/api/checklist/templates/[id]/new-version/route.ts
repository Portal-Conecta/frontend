import { NextResponse } from 'next/server'
import { createNewTemplateVersion } from '@portal/checklist/services/server/templateService'
import { bffErrorResponse } from '../../../_lib/bffError'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await createNewTemplateVersion(id)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}