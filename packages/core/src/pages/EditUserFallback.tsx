/**
 * EditUserFallback — skeleton do conteúdo de `/usuarios/[id]/editar` (#516),
 * usado pelo `loading.tsx` da rota (Suspense de navegação). Espelha a
 * estrutura de `PageEditUserContent` (cabeçalho real + campo Nome + "Ações de
 * risco" + Cancelar/Salvar) com o átomo `Skeleton` — mesmo padrão de
 * `cursos/[id]/loading.tsx`.
 */
import { Button, Icon, Skeleton, Text } from '@portal/ui'

export function EditUserFallback() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8" role="status" aria-live="polite">
      <span className="sr-only">Carregando formulário de edição de usuário...</span>

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name="chevron-left" size="lg" decorative className="text-text-brand" />
          <Text as="h1" variant="heading-h2" tone="brand">
            Editar usuário
          </Text>
        </div>
        <Button iconLeft="square-pen" disabled>
          Editar
        </Button>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 py-4">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" width={60} height={16} />
          <Skeleton variant="rect" height={44} />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton variant="text" width={110} height={20} />
          <div className="flex gap-2">
            <Skeleton variant="rect" width={140} height={36} />
            <Skeleton variant="rect" width={140} height={36} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton variant="rect" height={36} className="flex-1" />
          <Skeleton variant="rect" height={36} className="flex-1" />
        </div>
      </div>
    </div>
  )
}

export default EditUserFallback
