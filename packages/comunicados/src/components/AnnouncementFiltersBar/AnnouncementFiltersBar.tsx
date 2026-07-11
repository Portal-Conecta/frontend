'use client'

import { useMemo, useState } from 'react'

import { Button, DateInput, Field, Select, Text, type SelectOption } from '@portal/ui'

import type { ClassFilterOption } from '../../services/destinationCatalogMappers'

export interface AnnouncementFilters {
  curso?: string
  tipo?: string
  turma?: string
  turno?: string
  periodo?: string
  dataInicio?: string
  dataFim?: string
}

export interface AnnouncementFiltersBarProps {
  loading?: boolean
  cursoOptions?: SelectOption[]
  tipoOptions?: SelectOption[]
  turmaOptions?: ClassFilterOption[]
  turnoOptions?: SelectOption[]
  periodoOptions?: SelectOption[]
  onApply?: (filters: AnnouncementFilters) => void
  onRestore?: () => void
}

const todosOption: SelectOption = { value: 'todos', label: 'Todos' }

export const MURAL_TIPO_OPTIONS: SelectOption[] = [
  todosOption,
  { value: 'aviso', label: 'Aviso' },
  { value: 'evento', label: 'Evento' },
]

export const MURAL_PERIODO_OPTIONS: SelectOption[] = [
  todosOption,
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
]

function withTodos(options: SelectOption[]): SelectOption[] {
  return [todosOption, ...options]
}

function normalize(value: string | null): string | undefined {
  return value && value !== 'todos' ? value : undefined
}

export function AnnouncementFiltersBar({
  loading = false,
  cursoOptions = [todosOption],
  tipoOptions = MURAL_TIPO_OPTIONS,
  turmaOptions = [],
  turnoOptions = [todosOption],
  periodoOptions = MURAL_PERIODO_OPTIONS,
  onApply,
  onRestore,
}: AnnouncementFiltersBarProps) {
  const [curso, setCurso] = useState<string | null>('todos')
  const [tipo, setTipo] = useState<string | null>('todos')
  const [turma, setTurma] = useState<string | null>('todos')
  const [turno, setTurno] = useState<string | null>('todos')
  const [periodo, setPeriodo] = useState<string | null>('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const resolvedCursoOptions = useMemo(
    () => (cursoOptions.some((option) => option.value === 'todos') ? cursoOptions : withTodos(cursoOptions)),
    [cursoOptions],
  )
  const resolvedTurnoOptions = useMemo(
    () => (turnoOptions.some((option) => option.value === 'todos') ? turnoOptions : withTodos(turnoOptions)),
    [turnoOptions],
  )

  const filteredTurmaOptions = useMemo(() => {
    const selectedCurso = normalize(curso)
    const selectedTurno = normalize(turno)

    const filtered = turmaOptions.filter((option) => {
      if (selectedCurso && option.courseId !== selectedCurso) return false
      if (selectedTurno && option.shift !== selectedTurno) return false
      return true
    })

    return withTodos(filtered)
  }, [curso, turno, turmaOptions])

  function handleCursoChange(value: string | null) {
    setCurso(value)
    setTurma('todos')
  }

  function handleTurnoChange(value: string | null) {
    setTurno(value)
    setTurma('todos')
  }

  function buildFilters(): AnnouncementFilters {
    const filters: AnnouncementFilters = {}

    const normalizedCurso = normalize(curso)
    const normalizedTipo = normalize(tipo)
    const normalizedTurma = normalize(turma)
    const normalizedTurno = normalize(turno)
    const normalizedPeriodo = normalize(periodo)

    if (normalizedCurso) filters.curso = normalizedCurso
    if (normalizedTipo) filters.tipo = normalizedTipo
    if (normalizedTurma) filters.turma = normalizedTurma
    if (normalizedTurno) filters.turno = normalizedTurno
    if (normalizedPeriodo) filters.periodo = normalizedPeriodo
    if (dataInicio) filters.dataInicio = dataInicio
    if (dataFim) filters.dataFim = dataFim

    return filters
  }

  function handleRestore() {
    setCurso('todos')
    setTipo('todos')
    setTurma('todos')
    setTurno('todos')
    setPeriodo('todos')
    setDataInicio('')
    setDataFim('')
    onRestore?.()
  }

  return (
    <aside className="w-full max-w-lg bg-background-surface px-8 py-6">
      <Text as="h2" variant="body-xl-emphasis" tone="brand">
        Filtros
      </Text>

      <div className="mt-7 flex flex-col gap-4">
        <FilterSelect
          label="Curso"
          options={resolvedCursoOptions}
          value={curso}
          onChange={handleCursoChange}
          disabled={loading}
        />
        <FilterSelect label="Tipo" options={tipoOptions} value={tipo} onChange={setTipo} disabled={loading} />
        <FilterSelect
          label="Turma"
          options={filteredTurmaOptions}
          value={turma}
          onChange={setTurma}
          disabled={loading}
        />
        <FilterSelect
          label="Turno"
          options={resolvedTurnoOptions}
          value={turno}
          onChange={handleTurnoChange}
          disabled={loading}
        />
        <FilterSelect
          label="Período"
          options={periodoOptions}
          value={periodo}
          onChange={setPeriodo}
          disabled={loading}
        />

        <div className="flex items-center justify-between gap-3">
          <DateInput
            value={dataInicio}
            onChange={setDataInicio}
            disabled={loading}
            aria-label="Data inicial"
            {...(dataFim ? { max: dataFim } : {})}
          />

          <Text as="span" variant="label-xl-emphasis" tone="brand" aria-hidden="true">
            →
          </Text>

          <DateInput
            value={dataFim}
            onChange={setDataFim}
            disabled={loading}
            aria-label="Data final"
            {...(dataInicio ? { min: dataInicio } : {})}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <Button variant="outlined" fullWidth onClick={handleRestore} disabled={loading}>
            Restaurar
          </Button>

          <Button fullWidth onClick={() => onApply?.(buildFilters())} loading={loading}>
            Aplicar
          </Button>
        </div>
      </div>
    </aside>
  )
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string
  options: SelectOption[]
  value: string | null
  onChange: (value: string | null) => void
  disabled: boolean
}) {
  return (
    <Field label={label}>
      <Select options={options} value={value} onChange={onChange} placeholder="Todos" size="sm" disabled={disabled} />
    </Field>
  )
}
