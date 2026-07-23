import { AnnouncementWizardFallback } from '@portal/comunicados/pages/AnnouncementWizardFallback'

/**
 * Loading de navegação (Suspense) da rota /comunicados/criar (#518) — delega
 * ao fallback compartilhado do wizard (`AnnouncementWizardFallback`), mesmo
 * padrão de `comunicados/loading.tsx` (`MuralContentFallback`).
 */
export default function LoadingCriarComunicadoPage() {
  return (
    <AnnouncementWizardFallback
      backLabel="Voltar para o mural"
      title="Criar comunicado"
      loadingLabel="Carregando formulário de criação de comunicado..."
    />
  )
}
