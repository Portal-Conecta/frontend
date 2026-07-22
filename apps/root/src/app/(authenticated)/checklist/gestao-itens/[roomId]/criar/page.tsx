import { PageChecklistTemplateCreate } from '@portal/checklist/pages/PageChecklistTemplateCreate'

interface TemplateCreatePageProps {
  params: Promise<{ roomId: string }>
}

/**
 * Rota de criação do template de checklist de uma sala —
 * `/checklist/gestao-itens/[roomId]/criar`.
 *
 * Rota fina: delega todo o comportamento ao componente de página do domínio
 * `@portal/checklist`. Segue o mesmo padrão de `/checklist/gestao-itens/[roomId]`.
 */
export default async function TemplateCreatePage({ params }: TemplateCreatePageProps) {
  const { roomId } = await params
  return <PageChecklistTemplateCreate roomId={roomId} />
}
