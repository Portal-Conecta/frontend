'use client'

/**
 * TurmaList — a linha de busca + a lista de turmas (client). Recebe as turmas já
 * buscadas no servidor pela `PageTurma` e detém só o estado da **busca de texto**,
 * filtrando no cliente (`filterTurmas`) — o back não filtra. Cada turma é um
 * `ListItem`; sem resultados, mostra um estado vazio.
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, ClassCard, Input, ListItem, Text } from '@portal/ui'

import { ClassRepresentativesPanel } from './ClassRepresentativesPanel'
import { TurmaFiltersForm } from './TurmaFiltersForm'
import { TurmaMobileFilters } from './TurmaMobileFilters'
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

export function TurmaList({ turmas }: TurmaListProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<TurmaFilters>({})
  const [selectedTurma, setSelectedTurma] = useState<TurmaRow | null>(null)

  // Opções derivadas da lista completa (não da filtrada) para ficarem estáveis
  // enquanto se filtra.
  const { courses, shifts } = useMemo(() => turmaFilterOptions(turmas), [turmas])

  const filtered = useMemo(
    () => filterTurmas(applyTurmaFilters(turmas, filters), query),
    [turmas, filters, query],
  )

  // "Restaurar" limpa o filtro aplicado na hora (não espera "Aplicar").
  const resetFilters = () => setFilters({})

  return (
    <>
      <div className="mt-8 flex items-center gap-2">
        <Input
          className="flex-1 min-w-0"
          placeholder="Buscar turma"
          aria-label="Buscar turma"
          tone='brand'
          iconLeft='search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <TurmaMobileFilters
          courseOptions={courses}
          shiftOptions={shifts}
          onApply={setFilters}
          onReset={resetFilters}
        />
      </div>

      {selectedTurma ? (
        <ClassRepresentativesPanel
          turma={selectedTurma}
          onClose={() => setSelectedTurma(null)}
        />
      ) : (
        <div className="mt-8 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div>
            {filtered.length === 0 ? (
              <Text variant="body-sm" tone="secondary">
                Nenhuma turma encontrada.
              </Text>
            ) : (
              filtered.map((turma) => (
                <TurmaRowItem
                  key={turma.id}
                  turma={turma}
                  onManage={(selected) => {
                    router.push(`/turmas/${encodeURIComponent(selected.id)}`)
                  }}
                  onManageRepresentatives={setSelectedTurma}
                />
              ))
            )}
          </div>

          <div className="hidden px-8 py-3 lg:block">
            <TurmaFiltersForm
              courseOptions={courses}
              shiftOptions={shifts}
              onApply={setFilters}
              onReset={resetFilters}
            />
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Uma turma na lista — no mobile o curso e o turno empilham; no `md+` viram colunas.
 * "Gerenciar" leva pro detalhe da turma (#363), que é o ponto de entrada único:
 * a tela de membros (#364) virou atalho de dentro dele, não mais destino direto
 * da listagem. "Representantes" continua abrindo o subfluxo da #365 aqui mesmo,
 * sem passar pelo detalhe.
 */
function TurmaRowItem({
  turma,
  onManage,
  onManageRepresentatives,
}: {
  turma: TurmaRow
  onManage: (turma: TurmaRow) => void
  onManageRepresentatives: (turma: TurmaRow) => void
}) {
  return (
    <ListItem className="flex items-center justify-between gap-2 md:gap-4">
      <ClassCard
        variant="withBackground"
        tag={turma.code}
        title={turma.course}
        meta={turma.shift}
      />
      <span className="hidden items-center gap-2 md:inline-flex">
        <Button
          size="sm"
          variant="outlined"
          iconLeft="chevron-right"
          onClick={() => onManage(turma)}
        >
          Gerenciar
        </Button>
        <Button
          size="sm"
          variant="outlined"
          iconLeft="users"
          onClick={() => onManageRepresentatives(turma)}
        >
          Representantes
        </Button>
      </span>
      <span className="inline-flex items-center gap-2 md:hidden">
        <Button
          size="sm"
          variant="outlined"
          icon="users"
          aria-label={`Editar representantes de ${turma.code}`}
          onClick={() => onManageRepresentatives(turma)}
        />
        <Button
          size="sm"
          variant="outlined"
          icon="chevron-right"
          aria-label={`Gerenciar ${turma.code}`}
          onClick={() => onManage(turma)}
        />
      </span>
    </ListItem>
  )
}
