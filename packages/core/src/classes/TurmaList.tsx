'use client'

/**
 * TurmaList — a linha de busca + a lista de turmas (client). Recebe as turmas já
 * buscadas no servidor pela `PageTurma` e detém só o estado da **busca de texto**,
 * filtrando no cliente (`filterTurmas`) — o back não filtra. Sem resultados,
 * mostra um estado vazio.
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
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Text } from '@portal/ui'

import { TurmaFiltersForm } from './TurmaFiltersForm'
import { TurmaMobileFilters } from './TurmaMobileFilters'
import { TurmaSearchField } from './TurmaSearchField'
import {
  applyTurmaFilters,
  filterTurmas,
  turmaFilterOptions,
  type TurmaFilters,
  type TurmaRow,
} from './turmaRows'

export interface TurmaListProps {
  turmas: TurmaRow[]
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

export function TurmaList({ turmas }: TurmaListProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<TurmaFilters>({})

  // Opções derivadas da lista completa (não da filtrada) para ficarem estáveis
  // enquanto se filtra.
  const { courses, shifts } = useMemo(() => turmaFilterOptions(turmas), [turmas])

  const filtered = useMemo(
    () => filterTurmas(applyTurmaFilters(turmas, filters), query),
    [turmas, filters, query],
  )

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
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <div className="py-14 text-center">
              <Text as="p" variant="body-md" tone="secondary">
                Nenhuma turma encontrada.
              </Text>
            </div>
          ) : (
            <>
              {/* Mobile: cards empilhados, cada linha tocável. */}
              <ul className="flex flex-col md:hidden">
                {filtered.map((turma) => (
                  <li key={turma.id}>
                    <TurmaMobileRow turma={turma} onManage={openTurma} />
                  </li>
                ))}
              </ul>

              {/* Desktop: grid único (tabela) — colunas alinhadas entre as linhas. */}
              <ul className={`hidden bg-background-surface md:grid ${GRID_COLS}`}>
                {filtered.map((turma) => (
                  <TurmaDesktopRow key={turma.id} turma={turma} onManage={openTurma} />
                ))}
              </ul>
            </>
          )}
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
