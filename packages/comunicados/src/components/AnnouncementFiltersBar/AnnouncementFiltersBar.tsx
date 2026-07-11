'use client'

import { useState } from 'react'

import type { TypeUser } from '@portal/core'
import { Button, DateInput, Field, Select, Text, type SelectOption } from '@portal/ui'

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
  turmaOptions?: SelectOption[]
  turnoOptions?: SelectOption[]
  periodoOptions?: SelectOption[]
  onApply?: (filters: AnnouncementFilters) => void
  onRestore?: () => void
}

const todosOption: SelectOption[] = [{ value: 'todos', label: 'Todos' }]

function normalize(value: string | null): string | undefined {
  return value && value !== 'todos' ? value : undefined
}

export function AnnouncementFiltersBar({
  userType,
  loading = false,
  cursoOptions = todosOption,
  tipoOptions = todosOption,
  turmaOptions = todosOption,
  turnoOptions = todosOption,
  periodoOptions = todosOption,
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

  if (loading) {
    return <AnnouncementFiltersBarSkeleton userType={userType} />
  }

  const isStudent = userType === 'STUDENT'

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

  return (
    <aside className="w-full max-w-lg bg-background-surface px-8 py-6">
      <Text as="h2" variant="body-xl-emphasis" tone="brand">
        Filtros
      </Text>

      <div className="mt-7 flex flex-col gap-4">
        {!isStudent ? (
          <>
            <FilterSelect label="Curso" options={cursoOptions} value={curso} onChange={setCurso} />
            <FilterSelect label="Tipo" options={tipoOptions} value={tipo} onChange={setTipo} />
            <FilterSelect label="Turma" options={turmaOptions} value={turma} onChange={setTurma} />
            <FilterSelect label="Turno" options={turnoOptions} value={turno} onChange={setTurno} />
          </>
        ) : null}

        <FilterSelect label="Período" options={periodoOptions} value={periodo} onChange={setPeriodo} />

        <div className="flex items-center justify-between gap-3">
          <DateInput
            value={dataInicio}
            onChange={setDataInicio}
            aria-label="Data inicial"
            {...(dataFim ? { max: dataFim } : {})}
          />

          <Text as="span" variant="label-xl-emphasis" tone="brand" aria-hidden="true">
            →
          </Text>

          <DateInput
            value={dataFim}
            onChange={setDataFim}
            aria-label="Data final"
            {...(dataInicio ? { min: dataInicio } : {})}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
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
