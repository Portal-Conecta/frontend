import { PageChecklistEnvioDetalhe } from '@portal/checklist/pages/PageChecklistEnvioDetalhe'

interface EnvioDetalhePageProps {
  params: Promise<{ id: string }>
}

/**
 * Rota de detalhe do envio — `/checklist/nao-conformidades/envios/[id]`.
 *
 * Rota fina: delega todo o comportamento ao componente de página do domínio
 * `@portal/checklist`. Segue o mesmo padrão de `/comunicados/[id]`.
 */
export default async function EnvioDetalhePage({ params }: EnvioDetalhePageProps) {
  const { id } = await params
  return <PageChecklistEnvioDetalhe id={id} />
}
