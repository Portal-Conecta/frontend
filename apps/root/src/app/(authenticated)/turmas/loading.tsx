import { TurmaListFallback } from '@portal/core/classes/TurmaListFallback'

/**
 * Loading de navegação (Suspense) da rota /turmas (#515) — delega ao fallback do
 * domínio (`TurmaListFallback`), mesmo padrão de `usuarios/loading.tsx` (#489).
 * Evita duplicar aqui a estrutura de `PageTurma`/`TurmaList` (que já divergiria
 * com o tempo). O AppShell vem do layout `(authenticated)` e já está na tela.
 */
export default function LoadingTurmasPage() {
  return <TurmaListFallback />
}
