import { Icon, Skeleton, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /turmas/[classId]/membros (#515) —
 * espelha o cabeçalho (voltar + nome da turma + "/ Adicionar Usuários") e o
 * corpo de `TurmaMembrosManager` (grid de 2 colunas: lista vinculada + busca).
 * Só o nome da turma vem de dado assíncrono, então usamos `Skeleton` no título
 * e mantemos o restante do cabeçalho, que é estático.
 */
export default function LoadingTurmaMembrosPage() {
  return (
    <div className="px-8 py-6" role="status" aria-live="polite">
      <span className="sr-only">Carregando usuários da turma...</span>

      <div className="flex items-center gap-2 border-b border-border-default pb-4">
        <span className="text-text-secondary">
          <Icon name="chevron-left" size="lg" decorative />
        </span>
        <Skeleton variant="text" width={160} height={28} />
        <Text as="span" variant="heading-h2" tone="brand">
          / Adicionar Usuários
        </Text>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, panel) => (
          <div key={panel} className="flex flex-col gap-4">
            <Skeleton variant="text" width={140} height={20} />
            <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2">
              {Array.from({ length: 4 }, (_, row) => (
                <Skeleton key={row} variant="rect" height={56} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
