import { NextResponse } from 'next/server'

import { getSession } from '@portal/core/auth/session'
import { DEFAULT_TURMAS_PAGE_SIZE, listTurmasPage } from '@portal/core/classes/turmasService'
import { bffErrorResponse } from '@portal/core/http/bffError'

const MAX_SIZE = 20

/** Página >= 0; tamanho preso entre 1 e `MAX_SIZE` (teto evita `?size=999999`). */
function normalizePage(raw: string | null): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}
function normalizeSize(raw: string | null): number {
  if (raw == null || raw === '') return DEFAULT_TURMAS_PAGE_SIZE
  const n = Number(raw)
  if (!Number.isFinite(n)) return DEFAULT_TURMAS_PAGE_SIZE
  return Math.min(Math.max(Math.floor(n), 1), MAX_SIZE)
}

/**
 * BFF — busca paginada de turmas pra tela de gerenciamento (#532).
 *
 * `course`/`shift` casam com o rótulo exibido na linha (`TurmaRow.course` /
 * `TurmaRow.shift`), não com o id/enum cru — mesmo contrato de `turmaRows.ts`.
 * Sessão ausente cai em 401.
 */
export async function GET(req: Request) {
  const token = await getSession()
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const course = searchParams.get('course')?.trim()
  const shift = searchParams.get('shift')?.trim()
  const includeInactive = searchParams.get('includeInactive') === 'true'

  try {
    const data = await listTurmasPage(token, {
      search,
      filters: { ...(course ? { course } : {}), ...(shift ? { shift } : {}) },
      page: normalizePage(searchParams.get('page')),
      size: normalizeSize(searchParams.get('size')),
      includeInactive,
    })
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
