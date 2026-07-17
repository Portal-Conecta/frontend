import { NextResponse } from 'next/server'

import { getDashboardStats } from '@portal/checklist/services/dashboard'

import { bffErrorResponse } from '../../_lib/bffError'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') ?? undefined
    const to = searchParams.get('to') ?? undefined
    const data = await getDashboardStats(from, to)
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
