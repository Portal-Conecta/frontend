// apps/root/src/app/api/checklist/templates/route.ts
import { NextResponse } from 'next/server'
import { createTemplate, listTemplates } from '@portal/checklist/services/server/templateService'
import { bffErrorResponse } from '../_lib/bffError'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const category = searchParams.get('category') ?? undefined

    const data = await listTemplates({ roomId, status, category } as never)
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