import { HUB_SHIFT, type ApiFieldError, type HubShift } from '@portal/shared'

import type { CreateClassPayload } from './types'

/** Resultado de validação: valor normalizado ou erros por campo. */
export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: ApiFieldError[] }

const SHIFTS = Object.values(HUB_SHIFT) as HubShift[]

function trimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

/**
 * Valida e normaliza um payload de criação de turma. Curso, número e turno são
 * obrigatórios (espelha `CreateClassRequest`):
 * - `courseId`: string não-vazia;
 * - `number`: inteiro ≥ 1 (o core exige `minimum: 1`);
 * - `shift`: um dos valores de `HUB_SHIFT`.
 */
export function parseCreateClass(input: unknown): ParseResult<CreateClassPayload> {
  const obj = asRecord(input)
  const errors: ApiFieldError[] = []

  const courseId = trimmedString(obj.courseId)
  if (!courseId) errors.push({ field: 'courseId', message: 'Curso é obrigatório.' })

  // Rejeita string, float e ≤ 0 — só inteiro positivo passa. `number` pode chegar
  // como número (form serializado) e por isso não aceitamos string numérica aqui.
  const number = obj.number
  if (number === undefined || number === null) {
    errors.push({ field: 'number', message: 'Número é obrigatório.' })
  } else if (typeof number !== 'number' || !Number.isInteger(number) || number < 1) {
    errors.push({ field: 'number', message: 'Número deve ser um inteiro maior ou igual a 1.' })
  }

  const shift = obj.shift
  if (shift === undefined || shift === null || shift === '') {
    errors.push({ field: 'shift', message: 'Turno é obrigatório.' })
  } else if (!SHIFTS.includes(shift as HubShift)) {
    errors.push({ field: 'shift', message: `Turno deve ser um de: ${SHIFTS.join(', ')}.` })
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: { courseId: courseId!, number: number as number, shift: shift as HubShift },
  }
}
