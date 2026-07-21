import { NextResponse } from 'next/server'
import { createTemplate, listTemplates } from '@portal/checklist/services/server/templateService'
import { bffErrorResponse } from '../_lib/bffError'

export async function GET() {
  try {
    const data = await listTemplates()
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = await createTemplate(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return bffErrorResponse(err)
  }
}