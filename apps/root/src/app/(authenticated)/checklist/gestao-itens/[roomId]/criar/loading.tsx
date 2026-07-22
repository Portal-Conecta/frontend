import { Icon, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/gestao-itens/[roomId]/criar —
 * espelha o esqueleto do conteúdo (voltar + título + botões). Só o conteúdo:
 * o AppShell vem do layout `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingTemplateCreatePage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Icon name="chevron-left" size="lg" tone="primary" decorative />
        <Text as="h1" variant="heading-h2" tone="brand">
          Checklist
        </Text>
      </div>

      <div className="flex justify-end gap-3 border-t border-border-default pt-6">
        <div className="h-9 w-36 animate-pulse rounded-md border-sm border-border-default" />
        <div className="h-9 w-36 animate-pulse rounded-md border-sm border-border-default" />
      </div>
    </div>
  )
}
