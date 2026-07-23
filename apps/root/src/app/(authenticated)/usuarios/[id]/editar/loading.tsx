import { EditUserFallback } from '@portal/core/pages/EditUserFallback'

/**
 * Loading de navegação (Suspense) da rota /usuarios/[id]/editar (#516) —
 * delega ao fallback do domínio (`EditUserFallback`), mesmo padrão de
 * `comunicados/loading.tsx` (`MuralContentFallback`).
 */
export default function LoadingEditUsuarioPage() {
  return <EditUserFallback />
}
