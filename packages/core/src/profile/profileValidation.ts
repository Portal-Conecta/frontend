import type { ApiFieldError } from '@portal/shared'

import type { TypeUser } from '../rbac'
import type { CreateUserPayload, UpdateUserPayload } from './types'

export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: ApiFieldError[] }

const USER_TYPES = new Set<TypeUser>([
  'STUDENT',
  'REPRESENTATIVE',
  'TEACHER',
  'SENAI',
  'WEG',
  'ADMIN',
])

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function trimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function validateEmail(value: unknown, errors: ApiFieldError[], required: boolean): string | undefined {
  const email = trimmedString(value)
  if (!email) {
    if (required) errors.push({ field: 'email', message: 'E-mail é obrigatório.' })
    else if (value !== undefined) errors.push({ field: 'email', message: 'E-mail deve ser válido.' })
    return undefined
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'E-mail deve ser válido.' })
    return undefined
  }
  return email
}

/** Valida e normaliza o corpo de criação antes de chamar `POST /hub/users`. */
export function parseCreateUser(input: unknown): ParseResult<CreateUserPayload> {
  const obj = asRecord(input)
  const errors: ApiFieldError[] = []
  const name = trimmedString(obj.name)
  if (!name) errors.push({ field: 'name', message: 'Nome é obrigatório.' })

  const email = validateEmail(obj.email, errors, true)
  const typeUser = obj.typeUser
  if (!typeUser) {
    errors.push({ field: 'typeUser', message: 'Tipo é obrigatório.' })
  } else if (!USER_TYPES.has(typeUser as TypeUser)) {
    errors.push({ field: 'typeUser', message: `Tipo deve ser um de: ${[...USER_TYPES].join(', ')}.` })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: { name: name!, email: email!, typeUser: typeUser as TypeUser } }
}

/** Valida e normaliza a edição parcial antes de chamar `PATCH /hub/users/{id}`. */
export function parseUpdateUser(input: unknown): ParseResult<UpdateUserPayload> {
  const obj = asRecord(input)
  const errors: ApiFieldError[] = []
  const payload: UpdateUserPayload = {}

  if (obj.name !== undefined) {
    const name = trimmedString(obj.name)
    if (!name) errors.push({ field: 'name', message: 'Nome não pode ser vazio.' })
    else payload.name = name
  }
  if (obj.email !== undefined) {
    const email = validateEmail(obj.email, errors, false)
    if (email) payload.email = email
  }
  if (obj.avatarUrl !== undefined) {
    const avatarUrl = trimmedString(obj.avatarUrl)
    if (!avatarUrl) errors.push({ field: 'avatarUrl', message: 'Avatar não pode ser vazio.' })
    else payload.avatarUrl = avatarUrl
  }
  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({ field: 'body', message: 'Informe ao menos um campo para atualizar.' })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: payload }
}
