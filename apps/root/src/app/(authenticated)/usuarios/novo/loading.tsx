import { CreateUserFallback } from '@portal/core/pages/CreateUserFallback'

/**
 * Loading de navegação (Suspense) da rota /usuarios/novo (#516) — delega ao
 * fallback do domínio (`CreateUserFallback`), mesmo padrão de
 * `comunicados/loading.tsx` (`MuralContentFallback`).
 */
export default function LoadingCreateUsuarioPage() {
  return <CreateUserFallback />
}
