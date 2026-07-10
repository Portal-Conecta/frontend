import type { Metadata } from 'next'
import { PageAnnouncementDetail } from '@portal/comunicados/pages/PageAnnouncementDetail'
import { getAnnouncement } from '@portal/comunicados/services/server'

interface ComunicadoDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Metadata dinâmica com o título do comunicado. Reaproveita `getAnnouncement`.
 * NOTA: O httpClient usa cache: 'no-store' por padrão. Validar via Network tab
 * que o Next.js consegue aplicar o dedupe na request e não duplicar a chamada ao BFF.
 */
export async function generateMetadata({
  params,
}: ComunicadoDetailPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const detail = await getAnnouncement(id)
    return { title: detail.announcement.title }
  } catch {
    return { title: 'Comunicado' }
  }
}

/**
 * Rota de detalhe do comunicado — `/comunicados/[id]`.
 *
 * Rota fina: delega todo o comportamento ao componente de página do domínio
 * `@portal/comunicados`. Segue o mesmo padrão de `ComunicadosPage`.
 */
export default async function ComunicadoDetailPage({
  params,
}: ComunicadoDetailPageProps) {
  const { id } = await params
  return <PageAnnouncementDetail id={id} />
}
