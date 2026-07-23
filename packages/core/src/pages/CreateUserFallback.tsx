/**
 * CreateUserFallback — skeleton do conteúdo de `/usuarios/novo` (#516), usado
 * pelo `loading.tsx` da rota (Suspense de navegação). Espelha a estrutura de
 * `PageCreateUser`/`CreateUserForm` (cabeçalho real + 3 campos + botões +
 * link "Importar usuários por planilha") com o átomo `Skeleton` — mesmo
 * padrão de `cursos/[id]/loading.tsx`.
 */
import { Icon, Skeleton, Text } from '@portal/ui'

export function CreateUserFallback() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <header className="flex items-center gap-2 border-b border-border-default pb-4">
        <Icon name="chevron-left" size="lg" decorative className="text-text-brand" />
        <Text as="h1" variant="heading-h2" tone="brand">
          Criar Usuário
        </Text>
      </header>

      <div className="mx-auto flex w-full max-w-3xl justify-center">
        <div className="flex w-full max-w-xl flex-col gap-8 py-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" width={60} height={16} />
              <Skeleton variant="rect" height={44} />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" width={60} height={16} />
              <Skeleton variant="rect" height={44} />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" width={60} height={16} />
              <Skeleton variant="rect" height={44} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton variant="rect" height={44} className="flex-1" />
            <Skeleton variant="rect" height={44} className="flex-1" />
          </div>

          <Skeleton variant="text" width={220} height={20} className="self-center" />
        </div>
      </div>
    </div>
  )
}

export default CreateUserFallback
