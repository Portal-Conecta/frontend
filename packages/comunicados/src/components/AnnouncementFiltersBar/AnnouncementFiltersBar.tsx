'use client'

import { useMemo, useState } from 'react'

import type { TypeUser } from '@portal/core'
import { Button, DateInput, Field, Select, Text, type SelectOption } from '@portal/ui'

import type { ClassFilterOption } from '../../services/destinationCatalogMappers'
import { AnnouncementFiltersBarSkeleton } from './AnnouncementFiltersBarSkeleton'
import { clampDataFim, clampDataInicio } from './dateRange'

export interface AnnouncementFilters {
  curso?: string
  /** Origem do comunicado (`WEG` / `SENAI` / `BOTH`). */
  origem?: string
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
  origemOptions?: SelectOption[]
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

export const MURAL_ORIGEM_OPTIONS: SelectOption[] = [
  todosOption,
  { value: 'WEG', label: 'WEG' },
  { value: 'SENAI', label: 'SENAI' },
  { value: 'BOTH', label: 'WEG + SENAI' },
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
  origemOptions = MURAL_ORIGEM_OPTIONS,
  turmaOptions = [],
  turnoOptions = [todosOption],
  periodoOptions = MURAL_PERIODO_OPTIONS,
  onApply,
  onRestore,
  variant = 'sidebar',
  titleId,
}: AnnouncementFiltersBarProps) {
  const [curso, setCurso] = useState<string | null>('todos')
  const [origem, setOrigem] = useState<string | null>('todos')
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

  // Correção só ao sair do campo: o input nativo emite `onChange` a cada dígito,
  // e enquanto o ano é digitado ele passa por datas completas intermediárias
  // (o ano 2, depois 20, 202... antes de 2026). Corrigir no `onChange` faria o
  // clamp confundir isso com "data menor" e roubar o campo no primeiro dígito.
  function handleDataInicioBlur() {
    setDataInicio(clampDataInicio(dataInicio, dataFim))
  }

  function handleDataFimBlur() {
    setDataFim(clampDataFim(dataFim, dataInicio))
  }

  function buildFilters(): AnnouncementFilters {
    const filters: AnnouncementFilters = {}

    const normalizedCurso = normalize(curso)
    const normalizedOrigem = normalize(origem)
    const normalizedTurma = normalize(turma)
    const normalizedTurno = normalize(turno)
    const normalizedPeriodo = normalize(periodo)

    // UX: aluno não envia curso/origem/turma/turno — autorização real continua no BFF/backend.
    if (!isStudent) {
      if (normalizedCurso) filters.curso = normalizedCurso
      if (normalizedOrigem) filters.origem = normalizedOrigem
      if (normalizedTurma) filters.turma = normalizedTurma
      if (normalizedTurno) filters.turno = normalizedTurno
    }

    if (normalizedPeriodo) filters.periodo = normalizedPeriodo

    // Rede: o clamp já roda no blur, mas "Aplicar" pode ser acionado sem o campo
    // perder o foco. Ancorar na data inicial mantém o intervalo válido sem
    // alargá-lo (aplicar os dois clamps aqui trocaria as datas de lugar).
    if (dataInicio) filters.dataInicio = dataInicio
    const fim = clampDataFim(dataFim, dataInicio)
    if (fim) filters.dataFim = fim

    return filters
  }

  function handleApply() {
    // "Aplicar" pode ser acionado sem o campo perder o foco (o clamp roda no
    // blur). Sincroniza o estado do campo final para o usuário não continuar
    // vendo um intervalo invertido nos inputs depois de aplicar. Ancorado só na
    // data inicial (mesma escolha do `buildFilters`); clampar a inicial também
    // trocaria as datas de lugar em vez de colapsar o intervalo.
    const fim = clampDataFim(dataFim, dataInicio)
    if (fim !== dataFim) setDataFim(fim)
    onApply?.(buildFilters())
  }

  function handleRestore() {
    setCurso('todos')
    setOrigem('todos')
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
            {/* Origem fica no painel desktop; o modal mobile do Figma não inclui esse campo. */}
            {!isSheet ? (
              <FilterSelect label="Origem" options={origemOptions} value={origem} onChange={setOrigem} />
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

        {/*
          Sem `min`/`max` cruzando os dois campos: o spinner do ano do input
          nativo não desce abaixo do `min` — ele dá a volta e salta para o teto
          (uma seta para baixo em 2026 com `min=2026` devolve 2600, não 2025).
          Isso impediria o campo de emitir a data menor que o clamp precisa ver
          para igualar as duas. Quem garante o intervalo é o clamp; a faixa dos
          anos fica por conta da rede de segurança do próprio DateInput.
        */}
        <div className="flex items-center justify-between gap-3">
          <DateInput
            value={dataInicio}
            onChange={setDataInicio}
            onBlur={handleDataInicioBlur}
            aria-label="Data inicial"
            {...(isSheet ? { className: 'min-w-0 flex-1' } : {})}
          />

          {!isSheet ? (
            <Text as="span" variant="label-xl-emphasis" tone="brand" aria-hidden="true">
              →
            </Text>
          ) : null}

          <DateInput
            value={dataFim}
            onChange={setDataFim}
            onBlur={handleDataFimBlur}
            aria-label="Data final"
            {...(isSheet ? { className: 'min-w-0 flex-1' } : {})}
          />
        </div>

        <div className={isSheet ? 'flex gap-3 pt-1' : 'grid grid-cols-2 gap-6 pt-4'}>
          <Button variant="outlined" fullWidth onClick={handleRestore}>
            Restaurar
          </Button>

          <Button fullWidth onClick={handleApply}>
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
