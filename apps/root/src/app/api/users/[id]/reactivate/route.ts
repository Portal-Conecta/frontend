import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { bffErrorResponse } from '@portal/core/http/bffError'
import { reactivateUser } from '@portal/core/profile/profileService'

import { userIdFrom } from '../../_lib/userIdFrom'

interface RouteContext {
  params: Promise<{ id: string }>
}

/** BFF — reativa um usuário previamente desativado (`DISABLED` → `ACTIVE`). */
export async function POST(_req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  const id = await userIdFrom(context.params)
  if (!id) return NextResponse.json({ code: 'validation', message: 'id obrigatório.' }, { status: 400 })

  try {
    return NextResponse.json(await reactivateUser(id, token))
  } catch (err) {
    return bffErrorResponse(err)
  }
}
