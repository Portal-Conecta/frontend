import { PageChecklistTemplateManager } from '@portal/checklist/pages/PageChecklistTemplateManager'

interface TemplateManagerPageProps {
  params: Promise<{ roomId: string }>
}

/**
 * Rota de gestão do template de checklist de uma sala —
 * `/checklist/gestao-itens/[roomId]`.
 *
 * Rota fina: delega todo o comportamento ao componente de página do domínio
 * `@portal/checklist`. Segue o mesmo padrão de `/checklist/nao-conformidades/envios/[id]`.
 */
export default async function TemplateManagerPage({ params }: TemplateManagerPageProps) {
  const { roomId } = await params
  return <PageChecklistTemplateManager roomId={roomId} />
}
