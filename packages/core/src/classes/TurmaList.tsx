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
                onManage={() => router.push(`/turmas/${turma.id}/membros`)}
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
    </>
  )
}

/**
 * Uma turma na lista — no mobile o curso e o turno empilham; no `md+` viram colunas.
 * "Gerenciar" leva pra tela de adicionar usuários (#364) — a #363 (detalhe da
 * turma) ainda não existe; quando ela nascer, este é o destino que passa a virar
 * o atalho de dentro dela, não mais o ponto de entrada direto da listagem.
 */
function TurmaRowItem({ turma, onManage }: { turma: TurmaRow; onManage: () => void }) {
  return (
    <ListItem className="flex items-center justify-between gap-2 md:gap-4">
      <ClassCard
        variant="single"
        item={{ code: turma.code, course: turma.course, shift: turma.shift }}
      />
      <span className="hidden md:inline-flex">
        <Button size="sm" variant="outlined" iconLeft="chevron-right" onClick={onManage}>
          Gerenciar
        </Button>
      </span>
      <span className="inline-flex md:hidden">
        <Button
          size="sm"
          variant="outlined"
          icon="chevron-right"
          aria-label={`Gerenciar ${turma.code}`}
          onClick={onManage}
        />
      </span>
    </ListItem>
  )
}
