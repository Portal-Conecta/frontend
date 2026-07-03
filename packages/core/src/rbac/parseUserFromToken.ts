/**
 * Monta o `CurrentUser` a partir do JWT — puro (sem `next/headers`), testável.
 *
 * Decodifica o payload do token (base64url) e lê os claims `sub`, `userType` e
 * `classes`. **Não verifica a assinatura**: o token vem do nosso próprio cookie
 * httpOnly e o RBAC do front é só UX — o backend revalida o token em toda chamada.
 *
 * Nomes dos claims (`sub`, `userType`, `classes[].role`) seguem o backend atual; se
 * o token real divergir, o ajuste é aqui. Qualquer claim inválido → `null` (a favor
 * de esconder, nunca expor).
 */
import { resolvePermissions } from './rolePermissions'
import type { ClassMembership, ClassRole, CurrentUser, TypeUser } from './types'

const USER_TYPES: readonly TypeUser[] = [
  'STUDENT',
  'REPRESENTATIVE',
  'TEACHER',
  'SENAI',
  'WEG',
  'ADMIN',
]
const CLASS_ROLES: readonly ClassRole[] = ['STUDENT', 'TEACHER', 'REPRESENTATIVE']

interface JwtClaims {
  sub?: unknown
  userType?: unknown
  classes?: unknown
}

/** Decodifica um segmento base64url de JWT para objeto. `atob` é isomórfico. */
function decodeSegment(segment: string): unknown {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return JSON.parse(atob(padded))
}

function isTypeUser(value: unknown): value is TypeUser {
  return typeof value === 'string' && (USER_TYPES as readonly string[]).includes(value)
}

function isClassRole(value: unknown): value is ClassRole {
  return typeof value === 'string' && (CLASS_ROLES as readonly string[]).includes(value)
}

function parseClasses(raw: unknown): ClassMembership[] {
  if (!Array.isArray(raw)) return []
  const memberships: ClassMembership[] = []
  for (const item of raw) {
    if (item && typeof item === 'object') {
      const { classId, role } = item as Record<string, unknown>
      if (typeof classId === 'string' && isClassRole(role)) {
        memberships.push({ classId, role })
      }
    }
  }
  return memberships
}

export function parseUserFromToken(token: string | null | undefined): CurrentUser | null {
  if (!token) return null
  const payload = token.split('.')[1]
  if (!payload) return null

  let claims: JwtClaims
  try {
    claims = decodeSegment(payload) as JwtClaims
  } catch {
    return null
  }

  const id = typeof claims.sub === 'string' ? claims.sub : null
  if (!id || !isTypeUser(claims.userType)) return null

  return {
    id,
    userType: claims.userType,
    classes: parseClasses(claims.classes),
    permissions: resolvePermissions(claims.userType),
  }
}
