import { PageAnnouncementDetail } from '@portal/comunicados/pages/PageAnnouncementDetail'

interface ComunicadoDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Rota de detalhe do comunicado — `/comunicados/[id]`.
 *
 * Rota fina: delega todo o comportamento ao componente de página do domínio
 * `@portal/comunicados`. Segue o mesmo padrão de `ComunicadosPage`.
 */
export default async function ComunicadoDetailPage({ params }: ComunicadoDetailPageProps) {
  const { id } = await params
  return <PageAnnouncementDetail id={id} />
}
