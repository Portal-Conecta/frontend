'use client'

/**
 * Loading de navegação (Suspense) da rota /usuarios (#489) — título e botão
 * reais (sem custo, sem dado assíncrono). As linhas reusam o próprio
 * `UsersTable` no modo `loading` (mesmo estado de pulse do refetch
 * client-side), em vez de duplicar essa marcação aqui. `onViewProfile` é
 * obrigatório na prop mas inalcançável nesse modo — a linha nunca chega a
 * renderizar um card clicável enquanto `loading` for `true`.
 */
import { Button, Text } from '@portal/ui'

import { UsersTable } from '@portal/core/users/components/UsersTable'

export default function LoadingUsuariosPage() {
  return (
    <div className="flex flex-col gap-4 p-6 md:gap-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Text as="h1" variant="heading-h2" tone="brand">
          Usuários
        </Text>
        <Button iconLeft="plus">Criar Novo Usuário</Button>
      </div>

      <div className="h-11 animate-pulse rounded-lg border-sm border-border-default" />

      <div className="min-w-0">
        <UsersTable users={[]} loading onViewProfile={() => {}} />
      </div>
    </div>
  )
}
