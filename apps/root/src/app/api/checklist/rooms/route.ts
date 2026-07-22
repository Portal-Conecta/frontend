import { NextResponse } from 'next/server'
import { listHubRooms } from '@portal/checklist/services/server/hubRoomService'
import { bffErrorResponse } from '../_lib/bffError'

export async function GET() {
  try {
    const data = await listHubRooms()
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
