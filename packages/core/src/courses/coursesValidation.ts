import type { ApiFieldError } from '@portal/shared'

import type { CreateCoursePayload, UpdateCoursePayload } from './types'

/** Resultado de validação: valor normalizado (trim) ou erros por campo. */
export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: ApiFieldError[] }

/** Erros de validação de um item na criação em lote (`index` do payload). */
export interface BatchItemErrors {
  index: number
  errors: ApiFieldError[]
}

function trimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

/** Valida e normaliza um payload de criação. Código e nome são obrigatórios. */
export function parseCreateCourse(input: unknown): ParseResult<CreateCoursePayload> {
  const obj = asRecord(input)
  const code = trimmedString(obj.code)
  const name = trimmedString(obj.name)

  const errors: ApiFieldError[] = []
  if (!code) errors.push({ field: 'code', message: 'Código é obrigatório.' })
  if (!name) errors.push({ field: 'name', message: 'Nome é obrigatório.' })
  if (errors.length > 0) return { ok: false, errors }

  return { ok: true, value: { code: code!, name: name! } }
}

/**
 * Valida um array de payloads de criação (criação em lote). Ou todos os itens
 * são válidos — devolvidos normalizados — ou nada é enviado e os erros voltam por
 * índice.
 */
export function parseCreateCourseBatch(
  input: unknown,
): { ok: true; values: CreateCoursePayload[] } | { ok: false; errors: BatchItemErrors[] } {
  if (!Array.isArray(input)) {
    return {
      ok: false,
      errors: [{ index: -1, errors: [{ field: 'body', message: 'Envie uma lista de cursos.' }] }],
    }
  }
  if (input.length === 0) {
    return {
      ok: false,
      errors: [{ index: -1, errors: [{ field: 'body', message: 'Envie ao menos um curso.' }] }],
    }
  }

  const values: CreateCoursePayload[] = []
  const errors: BatchItemErrors[] = []
  input.forEach((item, index) => {
    const parsed = parseCreateCourse(item)
    if (parsed.ok) values.push(parsed.value)
    else errors.push({ index, errors: parsed.errors })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, values }
}

/**
 * Valida e normaliza um payload de edição. Ao menos um campo deve ser enviado, e
 * nenhum campo presente pode ser vazio.
 */
export function parseUpdateCourse(input: unknown): ParseResult<UpdateCoursePayload> {
  const obj = asRecord(input)
  const errors: ApiFieldError[] = []
  const value: UpdateCoursePayload = {}

  if (obj.code !== undefined) {
    const code = trimmedString(obj.code)
    if (!code) errors.push({ field: 'code', message: 'Código não pode ser vazio.' })
    else value.code = code
  }
  if (obj.name !== undefined) {
    const name = trimmedString(obj.name)
    if (!name) errors.push({ field: 'name', message: 'Nome não pode ser vazio.' })
    else value.name = name
  }
  if (obj.code === undefined && obj.name === undefined) {
    errors.push({ field: 'form', message: 'Informe ao menos um campo para atualizar.' })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value }
}
