import { Suspense } from "react";
import { getSession } from "@portal/core/auth/session";
import { parseUserFromToken } from "@portal/core/rbac";
import { ErrorPage } from "@portal/ui/molecules";
import { Skeleton } from "@portal/ui/atoms";
import { PageChecklistContent } from "./PageChecklistContent";

export async function PageChecklist() {
  const token = await getSession();
  const user = parseUserFromToken(token);

  // Somente REPRESENTATIVE e TEACHER podem acessar a tela de envio.
  // STUDENT sem o papel de representante será bloqueado.
  const isAllowed =
    user?.userType === "REPRESENTATIVE" || user?.userType === "TEACHER";

  if (!isAllowed) {
    return (
      <div className="p-6 h-[70vh]">
        <ErrorPage
          code="403"
          title="Acesso Negado"
          description="Você não tem permissão para preencher este checklist. Apenas professores e representantes podem realizar esta ação."
        />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-6">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <PageChecklistContent />
    </Suspense>
  );
}

export default PageChecklist;
