'use client'

import { useMemo, useState } from 'react'

import type { TypeUser } from '@portal/core'
import { Button, DateInput, Field, Select, Text, type SelectOption } from '@portal/ui'

import type { ClassFilterOption } from '../../services/destinationCatalogMappers'
import { AnnouncementFiltersBarSkeleton } from './AnnouncementFiltersBarSkeleton'

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
  /** Papel do usuário autenticado — deriva a variante reduzida para `STUDENT`. */
  userType?: TypeUser | undefined
  loading?: boolean
  cursoOptions?: SelectOption[]
  tipoOptions?: SelectOption[]
  turmaOptions?: ClassFilterOption[]
  turnoOptions?: SelectOption[]
  periodoOptions?: SelectOption[]
  onApply?: (filters: AnnouncementFilters) => void
  onRestore?: () => void
  /** `sidebar` = painel desktop; `sheet` = conteúdo do modal mobile. */
  variant?: 'sidebar' | 'sheet'
  /** id do título para `aria-labelledby` no sheet. */
  titleId?: string
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
  userType,
  loading = false,
  cursoOptions = [todosOption],
  tipoOptions = MURAL_TIPO_OPTIONS,
  turmaOptions = [],
  turnoOptions = [todosOption],
  periodoOptions = MURAL_PERIODO_OPTIONS,
  onApply,
  onRestore,
  variant = 'sidebar',
  titleId,
}: AnnouncementFiltersBarProps) {
  const [curso, setCurso] = useState<string | null>('todos')
  const [tipo, setTipo] = useState<string | null>('todos')
  const [turma, setTurma] = useState<string | null>('todos')
  const [turno, setTurno] = useState<string | null>('todos')
  const [periodo, setPeriodo] = useState<string | null>('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const isStudent = userType === 'STUDENT'
  const isSheet = variant === 'sheet'

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

  if (loading) {
    return <AnnouncementFiltersBarSkeleton userType={userType} variant={variant} />
  }

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

    // UX: aluno não envia curso/tipo/turma/turno — autorização real continua no BFF/backend.
    if (!isStudent) {
      if (normalizedCurso) filters.curso = normalizedCurso
      if (normalizedTipo) filters.tipo = normalizedTipo
      if (normalizedTurma) filters.turma = normalizedTurma
      if (normalizedTurno) filters.turno = normalizedTurno
    }

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

  const shellClass = isSheet
    ? 'flex w-full flex-col gap-3 bg-background-default px-6 py-6'
    : 'w-full max-w-lg bg-background-surface px-8 pb-6'

  const fieldsClass = isSheet ? 'flex flex-col gap-3' : 'mt-7 flex flex-col gap-4'

  return (
    <aside className={shellClass}>
      <Text
        as="h2"
        id={titleId}
        variant={isSheet ? 'body-md-emphasis' : 'body-xl-emphasis'}
        tone="brand"
      >
        Filtros
      </Text>

      <div className={fieldsClass}>
        {!isStudent ? (
          <>
            <FilterSelect
              label="Curso"
              options={resolvedCursoOptions}
              value={curso}
              onChange={handleCursoChange}
            />
            {/* Tipo fica no painel desktop; o modal mobile do Figma não inclui esse campo. */}
            {!isSheet ? (
              <FilterSelect label="Tipo" options={tipoOptions} value={tipo} onChange={setTipo} />
            ) : null}
            <FilterSelect
              label="Turma"
              options={filteredTurmaOptions}
              value={turma}
              onChange={setTurma}
            />
            <FilterSelect
              label="Turno"
              options={resolvedTurnoOptions}
              value={turno}
              onChange={handleTurnoChange}
            />
          </>
        ) : null}

        <FilterSelect label="Período" options={periodoOptions} value={periodo} onChange={setPeriodo} />

        <div className="flex items-center justify-between gap-3">
          <DateInput
            value={dataInicio}
            onChange={setDataInicio}
            aria-label="Data inicial"
            {...(isSheet ? { className: 'min-w-0 flex-1' } : {})}
            {...(dataFim ? { max: dataFim } : {})}
          />

          {!isSheet ? (
            <Text as="span" variant="label-xl-emphasis" tone="brand" aria-hidden="true">
              →
            </Text>
          ) : null}

          <DateInput
            value={dataFim}
            onChange={setDataFim}
            aria-label="Data final"
            {...(isSheet ? { className: 'min-w-0 flex-1' } : {})}
            {...(dataInicio ? { min: dataInicio } : {})}
          />
        </div>

        <div className={isSheet ? 'flex gap-3 pt-1' : 'grid grid-cols-2 gap-6 pt-4'}>
          <Button variant="outlined" fullWidth onClick={handleRestore}>
            Restaurar
          </Button>

          <Button fullWidth onClick={() => onApply?.(buildFilters())}>
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
}: {
  label: string
  options: SelectOption[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  return (
    <Field label={label}>
      <Select options={options} value={value} onChange={onChange} placeholder="Todos" size="sm" />
    </Field>
  )
}
