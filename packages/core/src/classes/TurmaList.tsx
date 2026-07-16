'use client'

/**
 * TurmaList — a linha de busca + a lista de turmas (client). Recebe as turmas já
 * buscadas no servidor pela `PageTurma` e detém só o estado da **busca de texto**,
 * filtrando no cliente (`filterTurmas`) — o back não filtra. Cada turma é um
 * `ListItem`; sem resultados, mostra um estado vazio.
 */
import { useMemo, useState } from 'react'

import { Button, Input, ListItem, Text } from '@portal/ui'

import { TurmaFiltersForm } from './TurmaFiltersForm'
import { TurmaMobileFilters } from './TurmaMobileFilters'
import { filterTurmas, type TurmaRow } from './turmaRows'

export interface TurmaListProps {
  turmas: TurmaRow[]
}

export function TurmaList({ turmas }: TurmaListProps) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => filterTurmas(turmas, query), [turmas, query])

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
        <TurmaMobileFilters />
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div>
          {filtered.length === 0 ? (
            <Text variant="body-sm" tone="secondary">
              Nenhuma turma encontrada.
            </Text>
          ) : (
            filtered.map((turma) => <TurmaRowItem key={turma.id} turma={turma} />)
          )}
        </div>

        <div className="hidden px-8 py-3 lg:block">
          <TurmaFiltersForm />
        </div>
      </div>
    </>
  )
}

/** Uma turma na lista — no mobile o curso e o turno empilham; no `md+` viram colunas. */
function TurmaRowItem({ turma }: { turma: TurmaRow }) {
  return (
    <ListItem className="flex items-center justify-between sm:gap-6">
      <div className="flex items-center">
        <div className="pr-2 md:pr-6">
          <Text variant="body-sm-emphasis" tone="brand">
            {turma.code}
          </Text>
        </div>
        <div className="flex flex-col gap-1 border-l-md border-text-brand md:flex-row md:gap-0 md:border-l-0 md:text-left">
          <div className="border-text-brand pl-4 md:border-x-md md:px-6">
            <Text variant="body-sm" tone="brand">
              {turma.course}
            </Text>
          </div>
          <div className="pl-4">
            <Text variant="body-sm" tone="brand">
              {turma.shift}
            </Text>
          </div>
        </div>
      </div>

      <span className="hidden md:inline-flex">
        <Button size="sm" variant="outlined" iconLeft="chevron-right">
          Gerenciar
        </Button>
      </span>
      <span className="inline-flex md:hidden">
        <Button size="sm" variant="outlined" icon="chevron-right" aria-label={`Gerenciar ${turma.code}`} />
      </span>
    </ListItem>
  )
}
