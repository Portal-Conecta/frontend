import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { httpErrorStatus } from '@portal/core/http/errors'
import { getMyProfile } from '@portal/core/profile/profileService'

/**
 * BFF de identidade resumida — alimenta o menu do avatar (issue #328), que
 * busca sob demanda ao abrir em vez do `AppShell` carregar em toda página.
 */
export async function GET() {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  try {
    const profile = await getMyProfile(token)
    return NextResponse.json(profile)
  } catch (err) {
    return NextResponse.json({ code: 'server' }, { status: httpErrorStatus(err) })
  }
}
