import { Icon, Skeleton, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /cursos/novo (#517) — espelha a
 * estrutura de `CoursePageHeader` + `CriarCursoFormWrapper` (título/subtítulo
 * + form código/nome + lista de rascunho vazia + ações) com o átomo
 * `Skeleton`, mesmo padrão de `usuarios/novo/loading.tsx` (#516).
 */
export default function LoadingCriarCursoPage() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando formulário de criação de curso...</span>

      <header>
        <div className="flex min-h-14 items-center gap-2 px-4 md:px-6">
          <Icon name="chevron-left" size="md" decorative className="text-text-brand" />
          <Text as="h1" variant="heading-h3" tone="brand" className="md:text-heading-h2">
            Criar Novo Curso
          </Text>
        </div>
        <div className="mx-8 border-b-sm border-border-default" />
      </header>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-10">
        <div className="flex w-full max-w-md flex-col items-start gap-2">
          <Skeleton variant="text" width={220} height={24} />
          <Skeleton variant="text" width={280} height={16} />
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="rect" height={44} />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="rect" height={44} />
          </div>
          <Skeleton variant="rect" width={160} height={40} className="mt-2" />
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <Skeleton variant="text" width={160} height={20} />
          <Skeleton variant="text" width={300} height={16} />

          <div className="flex gap-4">
            <Skeleton variant="rect" height={44} className="flex-1" />
            <Skeleton variant="rect" height={44} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
