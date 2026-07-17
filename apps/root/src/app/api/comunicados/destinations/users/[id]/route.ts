import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { HttpError } from '@portal/core/http/errors'
import { getUserById } from '@portal/core/profile/profileService'

import { bffErrorResponse } from '../../../_lib/bffError'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * BFF — busca um usuário do Hub por id (`GET /hub/users/{id}`).
 * Usado na edição para exibir o nome do destinatário USER.
 */
export async function GET(_req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ code: 'validation', message: 'id obrigatório' }, { status: 400 })
  }

  try {
    const user = await getUserById(id, token)
    return NextResponse.json(user)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json(
        { code: err.kind, message: err.message },
        { status: err.status ?? 503 },
      )
    }
    return bffErrorResponse(err)
  }
}
