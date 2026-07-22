import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { bffErrorResponse } from '@portal/core/http/bffError'
import { deleteUser, getUserById, updateUser } from '@portal/core/profile/profileService'
import { parseUpdateUser } from '@portal/core/profile/profileValidation'

interface RouteContext {
  params: Promise<{ id: string }>
}

async function userIdFrom(context: RouteContext): Promise<string | null> {
  const { id } = await context.params
  const normalized = id?.trim()
  return normalized || null
}

/** BFF — consulta o detalhe de um usuário por ID. */
export async function GET(_req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  const id = await userIdFrom(context)
  if (!id) return NextResponse.json({ code: 'validation', message: 'id obrigatório.' }, { status: 400 })

  try {
    return NextResponse.json(await getUserById(id, token))
  } catch (err) {
    return bffErrorResponse(err)
  }
}

/** BFF — atualiza o nome de um usuário; ciclo de vida tem endpoints próprios no Hub. */
export async function PATCH(req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  const id = await userIdFrom(context)
  if (!id) return NextResponse.json({ code: 'validation', message: 'id obrigatório.' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'validation', message: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = parseUpdateUser(body)
  if (!parsed.ok) {
    return NextResponse.json(
      { code: 'validation', message: 'Dados inválidos para atualização de usuário.', errors: parsed.errors },
      { status: 400 },
    )
  }

  try {
    return NextResponse.json(await updateUser(id, parsed.value, token))
  } catch (err) {
    return bffErrorResponse(err)
  }
}

/** BFF — marca o usuário para exclusão (`PENDING_DELETION`, purge futuro no Hub). */
export async function DELETE(_req: Request, context: RouteContext) {
  const token = await getSession()
  if (!token) return NextResponse.json({ code: 'unauthorized' }, { status: 401 })

  const id = await userIdFrom(context)
  if (!id) return NextResponse.json({ code: 'validation', message: 'id obrigatório.' }, { status: 400 })

  try {
    return NextResponse.json(await deleteUser(id, token))
  } catch (err) {
    return bffErrorResponse(err)
  }
}
