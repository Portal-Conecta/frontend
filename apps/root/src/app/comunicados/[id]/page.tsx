import type { Metadata } from 'next'

import { PageAnnouncementDetail } from '@portal/comunicados/pages/PageAnnouncementDetail'
import { getAnnouncement } from '@portal/comunicados/services'

interface ComunicadoDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Metadata dinâmica com o título do comunicado. Reaproveita `getAnnouncement`;
 * o Next.js faz memoization automática de `fetch` dentro do mesmo request, então
 * não gera uma segunda chamada de rede além da já feita por `PageAnnouncementDetail`.
 */
export async function generateMetadata({ params }: ComunicadoDetailPageProps): Promise<Metadata> {
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
export default async function ComunicadoDetailPage({ params }: ComunicadoDetailPageProps) {
  const { id } = await params
  return <PageAnnouncementDetail id={id} />
}