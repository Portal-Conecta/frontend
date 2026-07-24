import type { ApiFieldError } from '@portal/shared'

import { isTypeUser, TYPE_USER_VALUES } from '../rbac'
import type { CreateUserPayload, UpdateUserPayload } from './types'

export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: ApiFieldError[] }

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
  const validTypeUser = isTypeUser(typeUser) ? typeUser : undefined
  if (!typeUser) {
    errors.push({ field: 'typeUser', message: 'Tipo é obrigatório.' })
  } else if (!validTypeUser) {
    errors.push({ field: 'typeUser', message: `Tipo deve ser um de: ${TYPE_USER_VALUES.join(', ')}.` })
  } else if (validTypeUser === 'REPRESENTATIVE') {
    // REPRESENTATIVE não nasce na criação (#502) — é promoção de um STUDENT já existente numa turma.
    errors.push({ field: 'typeUser', message: 'Representante não pode ser criado diretamente.' })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: { name: name!, email: email!, typeUser: validTypeUser! } }
}

/** Valida e normaliza a edição parcial antes de chamar `PATCH /hub/users/{id}`. */
export function parseUpdateUser(input: unknown): ParseResult<UpdateUserPayload> {
  const obj = asRecord(input)
  const errors: ApiFieldError[] = []
  const payload: UpdateUserPayload = {}

  for (const field of Object.keys(obj)) {
    if (field !== 'name') {
      errors.push({ field, message: `Campo não suportado na atualização: ${field}.` })
    }
  }

  if (obj.name !== undefined) {
    const name = trimmedString(obj.name)
    if (!name) errors.push({ field: 'name', message: 'Nome não pode ser vazio.' })
    else payload.name = name
  }
  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({ field: 'body', message: 'Informe ao menos um campo para atualizar.' })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: payload }
}
