'use client'

/**
 * TurmaFiltersForm — os campos de filtro de Turmas (Curso, Turno + Restaurar/
 * Aplicar). Fonte única reusada pela coluna lateral no desktop e pelo
 * `TurmaFiltersSheet` no mobile, para os dois não divergirem.
 *
 * Detém só o **rascunho** dos dropdowns; a lista filtrada vive na `TurmaList`.
 * "Aplicar" emite a seleção via `onApply`; "Restaurar" limpa o rascunho e o
 * filtro aplicado via `onReset` (espelha o `AnnouncementFiltersBar` de
 * comunicados). Curso e turno são independentes — sem lógica de dependência.
 */
import { useState } from 'react'

import { Button, Field, Select, Text, type SelectOption } from '@portal/ui'

import type { TurmaFilters } from './turmaRows'

const TODOS = 'todos'
const todosOption: SelectOption = { value: TODOS, label: 'Todos' }

export interface TurmaFiltersFormProps {
  /** Id do título — liga o heading ao `aria-labelledby` do dialog (sheet). */
  titleId?: string
  /** Opções de curso (rótulos exibidos na linha). */
  courseOptions?: string[] | undefined
  /** Opções de turno (rótulos exibidos na linha). */
  shiftOptions?: string[] | undefined
  /** Aplicar filtros. No sheet, o wrapper também fecha. */
  onApply?: ((filters: TurmaFilters) => void) | undefined
  /** Restaurar filtros ao padrão (limpa também o filtro já aplicado). */
  onReset?: (() => void) | undefined
}

function toOptions(values: string[]): SelectOption[] {
  return [todosOption, ...values.map((value) => ({ value, label: value }))]
}

function normalize(value: string | null): string | undefined {
  return value && value !== TODOS ? value : undefined
}

export function TurmaFiltersForm({
  titleId,
  courseOptions = [],
  shiftOptions = [],
  onApply = () => {},
  onReset = () => {},
}: TurmaFiltersFormProps) {
  const [course, setCourse] = useState<string | null>(TODOS)
  const [shift, setShift] = useState<string | null>(TODOS)

  function handleApply() {
    const filters: TurmaFilters = {}
    const selectedCourse = normalize(course)
    const selectedShift = normalize(shift)
    if (selectedCourse) filters.course = selectedCourse
    if (selectedShift) filters.shift = selectedShift
    onApply(filters)
  }

  function handleReset() {
    setCourse(TODOS)
    setShift(TODOS)
    onReset()
  }

  return (
    <div className="flex flex-col gap-6">
      <Text {...(titleId ? { id: titleId } : {})} variant="heading-h3" tone="brand">
        Filtros
      </Text>

      <Field label="Curso">
        <Select
          options={toOptions(courseOptions)}
          value={course}
          onChange={setCourse}
          placeholder="Todos"
          size="sm"
        />
      </Field>
      <Field label="Turno">
        <Select
          options={toOptions(shiftOptions)}
          value={shift}
          onChange={setShift}
          placeholder="Todos"
          size="sm"
        />
      </Field>

      <div className="flex gap-3">
        <Button fullWidth variant="outlined" size="xs" onClick={handleReset}>
          Restaurar
        </Button>
        <Button fullWidth size="xs" onClick={handleApply}>
          Aplicar
        </Button>
      </div>
    </div>
  )
}
