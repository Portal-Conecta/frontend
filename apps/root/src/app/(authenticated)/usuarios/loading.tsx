import { UsersListFallback } from '@portal/core/pages/UsersListFallback'

/**
 * Loading de navegação (Suspense) da rota /usuarios (#489) — delega ao
 * fallback do domínio (`UsersListFallback`), mesmo padrão de
 * `comunicados/loading.tsx` (`MuralContentFallback`). Evita duplicar aqui a
 * estrutura de `PageUsuariosContent` (já divergiu uma vez: #492 review).
 */
export default function LoadingUsuariosPage() {
  return <UsersListFallback />
}
