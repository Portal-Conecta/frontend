'use client'

/**
 * TurmaListFallback — skeleton do conteúdo da lista de turmas (#515), usado pelo
 * `loading.tsx` da rota `/turmas` (Suspense de navegação). Espelha a estrutura
 * de `PageTurma` + `TurmaList` (cabeçalho com `CreateTurmaButton`, busca, grid
 * 2fr/1fr com o filtro lateral) — mesmo motivo do `UsersListFallback` (#489):
 * um só lugar pra não divergir da tela real com o tempo.
 *
 * Reusa os componentes estáticos (`TurmaSearchField`, `TurmaFiltersForm` com
 * opções vazias) e mostra linhas em pulse no lugar da lista. `value`/`onChange`
 * são no-op só enquanto o Suspense não resolve (por isso é client — passar a
 * função a um client component exige o boundary).
 */
import { Button, Text } from '@portal/ui'

import { CreateTurmaButton } from './CreateTurmaButton'
import { TurmaFiltersForm } from './TurmaFiltersForm'
import { TurmaSearchField } from './TurmaSearchField'

export function TurmaListFallback() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Text as="h1" variant="heading-h2" tone="brand">
          Turmas
        </Text>
        <CreateTurmaButton />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <TurmaSearchField className="min-w-0 flex-1" value="" onChange={() => {}} />
          <Button iconLeft="funnel" variant="outlined" size="xs" className="shrink-0 lg:hidden">
            Filtros
          </Button>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[2fr_1fr] lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-col" role="status" aria-live="polite">
            <span className="sr-only">Carregando turmas...</span>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-18 animate-pulse border-b border-border-default" />
            ))}
          </div>

          <div className="hidden lg:block">
            <TurmaFiltersForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TurmaListFallback
