'use client'

/**
 * UsersListFallback — skeleton do conteúdo da lista de usuários (#489),
 * usado pelo `loading.tsx` da rota `/usuarios` (Suspense de navegação).
 * Espelha a estrutura de `PageUsuariosContent` (cabeçalho com
 * `CreateUserButton`, busca, grid de 2 colunas com filtros) — mesmo
 * componente pros dois lugares, pra não divergir estrutura com o tempo
 * (mesmo motivo do `MuralContentFallback` em comunicados). Reusa os
 * componentes reais (`UsersSearchField`, `UsersFiltersBar`, `UsersTable`) —
 * `UsersFiltersBar` não depende de dado assíncrono (opções fixas), e
 * `UsersTable` no modo `loading` já traz o próprio placeholder de linhas
 * (pulse). `value`/`onChange`/`onViewProfile` viram no-op só porque a
 * página real ainda não montou — some assim que o Suspense resolve.
 */
import { Button, Text } from '@portal/ui'

import { CreateUserButton } from '../users/components/CreateUserButton'
import { UsersFiltersBar } from '../users/components/UsersFiltersBar'
import { UsersSearchField } from '../users/components/UsersSearchField'
import { UsersTable } from '../users/components/UsersTable'

export function UsersListFallback() {
  return (
    <div className="flex flex-col gap-4 p-6 md:gap-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Text as="h1" variant="heading-h2" tone="brand">
          Usuários
        </Text>
        <CreateUserButton />
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <UsersSearchField value="" onChange={() => {}} />
        </div>
        <Button variant="outlined" iconLeft="funnel" className="shrink-0 md:hidden">
          Filtros
        </Button>
      </div>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-[2fr_1fr] md:items-start md:gap-8">
        <div className="hidden md:block md:order-2">
          <UsersFiltersBar />
        </div>

        <div className="min-w-0 md:order-1">
          <UsersTable users={[]} loading onViewProfile={() => {}} />
        </div>
      </div>
    </div>
  )
}

export default UsersListFallback
