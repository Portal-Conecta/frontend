import { Text } from '@portal/ui'

/**
 * Placeholder do mural de comunicados — destino pós-login e rota protegida.
 * Substituível pelo organism real quando o domínio de comunicados existir.
 */
export default function ComunicadosPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2 p-8">
      <Text as="h1" variant="heading-h2" tone="primary">
        Mural de Comunicados
      </Text>
      <Text variant="body-md" tone="secondary">
        Em breve.
      </Text>
    </main>
  )
}
