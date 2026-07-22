import { Icon, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/gestao-itens/[roomId] —
 * espelha o esqueleto do conteúdo (voltar + título + linhas). Só o conteúdo:
 * o AppShell vem do layout `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingTemplateManagerPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Icon name="chevron-left" size="lg" tone="primary" decorative />
        <Text as="h1" variant="heading-h2" tone="brand">
          Checklist
        </Text>
      </div>

      <div className="flex flex-col" role="status" aria-live="polite">
        <span className="sr-only">Carregando itens do checklist...</span>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse border-t border-border-default" />
        ))}
      </div>
    </div>
  )
}
