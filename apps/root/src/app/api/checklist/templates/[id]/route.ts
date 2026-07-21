import { NextResponse } from 'next/server'
import { findTemplateById, editTemplate } from '@portal/checklist/services/server/templateService'
import { bffErrorResponse } from '../../_lib/bffError'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await findTemplateById(id)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = await editTemplate(id, body)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}