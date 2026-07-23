import { AnnouncementWizardFallback } from '@portal/comunicados/pages/AnnouncementWizardFallback'

/**
 * Loading de navegação (Suspense) da rota /comunicados/[id]/editar (#518) —
 * delega ao fallback compartilhado do wizard (`AnnouncementWizardFallback`),
 * mesmo padrão de `comunicados/loading.tsx` (`MuralContentFallback`).
 */
export default function LoadingEditarComunicadoPage() {
  return (
    <AnnouncementWizardFallback
      backLabel="Voltar para meus comunicados"
      title="Editar comunicado"
      loadingLabel="Carregando formulário de edição de comunicado..."
    />
  )
}
