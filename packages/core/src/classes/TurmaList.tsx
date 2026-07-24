'use client'

/**
 * TurmaList — a linha de busca + a lista de turmas (client). SSR (`PageTurma`)
 * entrega a primeira página; busca (debounce), filtro de curso/turno e troca de
 * página disparam refetch em `GET /api/turmas` (`turmasClient`, #532) — o back
 * pagina de verdade quando não há filtro ativo, ver `turmasService`.
 *
 * Reset de página ao mudar busca/filtro: ajuste durante o render (padrão do
 * React pra "resetar estado quando outro muda"), não em efeito separado — um
 * efeito próprio rodaria no mesmo commit do efeito de busca abaixo, que ainda
 * leria o `page` antigo da closure e disparava um fetch descartado com a
 * página errada antes do reset propagar (mesmo padrão do `PageUsuariosContent`).
 * Guard de resposta obsoleta via `seqRef` — mesmo padrão do `TurmaMemberSearchPanel`.
 *
 * `courseOptions`/`shiftOptions` vêm sempre do backend (`courseOptionsFromCourses`
 * + `HUB_SHIFT_LABELS`), não das linhas carregadas — a página atual não cobre
 * todos os cursos/turnos existentes.
 *
 * Tipografia (`label-md`, Inter) e o botão "Gerenciar" (outlined) espelham a
 * lista de Cursos para as telas combinarem.
 *
 * Alinhamento das colunas: no desktop a lista inteira é **um único grid** (uma
 * "tabela"), não um grid por linha. Assim cada coluna se dimensiona pelo
 * conteúdo mais largo de toda a lista e **bate verticalmente entre as linhas** —
 * o nome do curso aparece inteiro (a coluna cresce até o conteúdo, com um teto
 * responsivo por breakpoint; passando do teto, o nome quebra linha) sem
 * desalinhar código, turno e botão. No mobile cada turma vira um card tocável.
 *
 * "Gerenciar" leva pro detalhe da turma (#363), ponto de entrada único: membros
 * (#364) e representantes (#365) são atalhos de dentro do detalhe.
 */
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Banner, Button, Pagination, Text } from '@portal/ui'

import { HttpError } from '../http/errors'
import { TurmaFiltersForm } from './TurmaFiltersForm'
import { TurmaMobileFilters } from './TurmaMobileFilters'
import { TurmaSearchField } from './TurmaSearchField'
import type { TurmaFilters, TurmaRow } from './turmaRows'
import { listTurmasClient } from './turmasClient'

const SEARCH_DEBOUNCE_MS = 300

export interface TurmaListProps {
  initialRows: TurmaRow[]
  initialTotalElements: number
  initialCourseOptions: string[]
  initialShiftOptions: string[]
  pageSize: number
}

/**
 * Colunas do grid compartilhado (código │ nome │ turno │ espaçador │ botão).
 *
 * A coluna do nome é `minmax(0, TETO)`: cresce até o conteúdo mais largo, mas
 * nunca passa do teto (aí o nome quebra linha). O teto é responsivo porque a
 * largura útil da lista muda por breakpoint:
 * - `md` (≤1023): a lista é full-width (o filtro fica no sheet), então sobra
 *   espaço — teto maior (`24rem`) pra o nome não ficar espremido.
 * - `lg` (≥1024): o filtro lateral aparece e a lista vira 2fr (mais estreita),
 *   então o teto encolhe (`18rem`).
 * - `xl`/`2xl`: cresce pra aproveitar a tela.
 * Como é `minmax(0, TETO)`, a coluna encolhe sozinha em telas estreitas (nunca
 * estoura), então o teto é só o limite superior em telas com espaço sobrando.
 * O `1fr` do espaçador empurra o botão pra direita.
 */
const GRID_COLS =
  'md:grid-cols-[auto_minmax(0,24rem)_auto_1fr_auto] lg:grid-cols-[auto_minmax(0,18rem)_auto_1fr_auto] xl:grid-cols-[auto_minmax(0,28rem)_auto_1fr_auto] 2xl:grid-cols-[auto_minmax(0,36rem)_auto_1fr_auto]'

export function TurmaList({
  initialRows,
  initialTotalElements,
  initialCourseOptions,
  initialShiftOptions,
  pageSize,
}: TurmaListProps) {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filters, setFilters] = useState<TurmaFilters>({})
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState<TurmaRow[]>(initialRows)
  const [totalElements, setTotalElements] = useState(initialTotalElements)
  const [courses, setCourses] = useState(initialCourseOptions)
  const [shifts, setShifts] = useState(initialShiftOptions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [query])

  const filterKey = `${debouncedQuery}|${filters.course ?? ''}|${filters.shift ?? ''}`
  const [committedFilterKey, setCommittedFilterKey] = useState(filterKey)
  if (filterKey !== committedFilterKey) {
    setCommittedFilterKey(filterKey)
    setPage(1)
  }

  const isFirstRun = useRef(true)
  const seqRef = useRef(0)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    const seq = ++seqRef.current
    setLoading(true)
    setError(false)

    listTurmasClient({
      page: page - 1,
      size: pageSize,
      search: debouncedQuery,
      ...(filters.course ? { course: filters.course } : {}),
      ...(filters.shift ? { shift: filters.shift } : {}),
    })
      .then((result) => {
        if (seq !== seqRef.current) return
        setRows(result.rows)
        setTotalElements(result.totalElements)
        setCourses(result.courseOptions)
        setShifts(result.shiftOptions)
      })
      .catch((err) => {
        if (seq !== seqRef.current) return
        if (err instanceof HttpError && err.kind === 'unauthorized') {
          router.replace('/login')
          return
        }
        setError(true)
        setRows([])
      })
      .finally(() => {
        if (seq !== seqRef.current) return
        setLoading(false)
      })
  }, [debouncedQuery, filters, page, pageSize, router])

  const openTurma = (turma: TurmaRow) => router.push(`/turmas/${encodeURIComponent(turma.id)}`)

  // "Restaurar" limpa o filtro aplicado na hora (não espera "Aplicar").
  const resetFilters = () => setFilters({})

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <TurmaSearchField className="min-w-0 flex-1" value={query} onChange={setQuery} />
        <TurmaMobileFilters
          courseOptions={courses}
          shiftOptions={shifts}
          onApply={setFilters}
          onReset={resetFilters}
        />
      </div>

      {/* Mobile: filtro num sheet à parte. Desktop (lg): lista 2fr | filtro 1fr. */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[2fr_1fr] lg:items-start lg:gap-8">
        <div className="min-w-0" aria-busy={loading}>
          {error ? (
            // Mesmo texto e componente da falha de SSR (`PageTurma`) — um só
            // tratamento visual pra esse estado, esteja a falha na carga
            // inicial ou num refetch (busca/filtro/paginação).
            <Banner variant="error">Não foi possível carregar as turmas.</Banner>
          ) : rows.length === 0 ? (
            <div className="py-14 text-center">
              <Text as="p" variant="body-md" tone="secondary">
                Nenhuma turma encontrada.
              </Text>
            </div>
          ) : (
            <>
              {/* Mobile: cards empilhados, cada linha tocável. */}
              <ul className="flex flex-col md:hidden">
                {rows.map((turma) => (
                  <li key={turma.id}>
                    <TurmaMobileRow turma={turma} onManage={openTurma} />
                  </li>
                ))}
              </ul>

              {/* Desktop: grid único (tabela) — colunas alinhadas entre as linhas. */}
              <ul className={`hidden bg-background-surface md:grid ${GRID_COLS}`}>
                {rows.map((turma) => (
                  <TurmaDesktopRow key={turma.id} turma={turma} onManage={openTurma} />
                ))}
              </ul>
            </>
          )}

          {!error && totalElements > pageSize ? (
            <div className="mt-4 flex justify-end">
              <Pagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={totalElements}
                onPageChange={setPage}
                disabled={loading}
              />
            </div>
          ) : null}
        </div>

        <div className="hidden lg:block">
          <TurmaFiltersForm
            courseOptions={courses}
            shiftOptions={shifts}
            onApply={setFilters}
            onReset={resetFilters}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile: a linha inteira é o alvo tocável (sem botão dedicado no layout
 * estreito). Código à esquerda; nome e turno empilhados. O nome quebra linha
 * (aparece inteiro, sem truncar).
 */
function TurmaMobileRow({
  turma,
  onManage,
}: {
  turma: TurmaRow
  onManage: (turma: TurmaRow) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onManage(turma)}
      aria-label={`Gerenciar ${turma.code}`}
      className="flex min-h-18 w-full items-center gap-3 border-b border-border-default bg-background-surface px-3 py-3 text-left"
    >
      <Text
        as="span"
        variant="label-md-emphasis"
        tone="brand"
        className="w-24 shrink-0 truncate border-r border-border-focus pr-3"
      >
        {turma.code}
      </Text>
      <span className="flex min-w-0 flex-1 flex-col">
        <Text as="span" variant="label-md" tone="brand" className="break-words">
          {turma.course}
        </Text>
        <Text as="span" variant="label-sm" tone="secondary" className="break-words">
          {turma.shift}
        </Text>
      </span>
    </button>
  )
}

/**
 * Desktop: uma turma como um conjunto de células do grid compartilhado. O `<li>`
 * é `display:contents`, então as células viram itens diretos do grid da `<ul>` e
 * se alinham às células das outras linhas. Cada célula estica na altura da linha
 * (grid `stretch`) e carrega a `border-b`, formando a régua horizontal contínua.
 * As réguas verticais ficam no texto (altura do texto, centradas), como no
 * `CourseRow`; o respiro dos dois lados é igual (`pr-4`/`pl-4` = 16px).
 */
function TurmaDesktopRow({
  turma,
  onManage,
}: {
  turma: TurmaRow
  onManage: (turma: TurmaRow) => void
}) {
  const cell = 'flex min-h-18 items-center border-b border-border-default py-3'

  return (
    <li className="contents">
      <div className={`${cell} pl-3`}>
        <Text
          as="span"
          variant="label-md-emphasis"
          tone="brand"
          className="w-full truncate border-r border-border-focus pr-4"
        >
          {turma.code}
        </Text>
      </div>
      <div className={`${cell} min-w-0 justify-center`}>
        <Text as="span" variant="label-md" tone="brand" className="min-w-0 break-words px-4 text-center">
          {turma.course}
        </Text>
      </div>
      <div className={cell}>
        <Text as="span" variant="label-md" tone="brand" className="border-l border-border-focus px-4">
          {turma.shift}
        </Text>
      </div>
      <div className="min-h-18 border-b border-border-default" aria-hidden="true" />
      <div className={`${cell} justify-end pr-3`}>
        <Button
          variant="outlined"
          size="sm"
          iconLeft="chevron-right"
          onClick={() => onManage(turma)}
          className="shrink-0"
        >
          Gerenciar
        </Button>
      </div>
    </li>
  )
}
