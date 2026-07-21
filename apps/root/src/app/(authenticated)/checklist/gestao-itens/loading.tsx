import { Text } from '@portal/ui'

export default function LoadingGestaoItensPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Text as="h1" variant="heading-h2" tone="brand">
          Gestão de Itens
        </Text>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-background-default" />
      </div>

      <div className="flex flex-col space-y-4" role="status" aria-live="polite">
        <span className="sr-only">Carregando checklists...</span>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-md border border-border-default bg-background-default" />
        ))}
      </div>
    </div>
  )
}
