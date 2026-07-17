/**
 * Página do dashboard de checklists.
 * AppShell vem do layout `(authenticated)` (#405) — a página só renderiza o conteúdo.
 */
import { PageChecklistDashboardContent } from "./PageChecklistDashboardContent";

export async function PageChecklistDashboard() {
  return (
    <div className="min-h-full bg-background-default p-6 md:p-8 lg:p-10">
      <PageChecklistDashboardContent />
    </div>
  );
}

export default PageChecklistDashboard;
