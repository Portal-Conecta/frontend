/**
 * PageChecklistNaoConformidades — painel de triagem de não conformidades
 * (persona "supervisor": professor, supervisor WEG, coordenador SENAI — ver
 * issues #18/#34). Server Component: resolve sessão e `CurrentUser`, gateia por
 * RBAC e faz o SSR da lista inicial; filtro/ações ficam no client
 * (`PageChecklistNaoConformidadesContent`).
 *
 * RBAC: `checklist:gerenciar` (TEACHER, SENAI, WEG, ADMIN — não o
 * representante, que só preenche checklist). A Sidebar não tem item próprio
 * pra esta rota ainda; este gate cobre acesso direto pela URL. O gate real
 * continua sendo o 403 do backend em cada chamada (REVISION.md §5).
 *
 * Sala (`room`) vem enriquecida do Hub na listagem de execuções; turma usa
 * `listClasses` à parte. Não mostra "preenchido por" — o backend não tem
 * provider de usuário do Hub pra resolver isso ainda.
 */
import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { HttpError } from "@portal/core/http/errors";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";
import { PermissionGate } from "@portal/core";
import { listClasses } from "@portal/core/classes/classesService";
import { ErrorPage } from "@portal/ui";

import { resolveChecklistSectionTabs } from "../components/checklistSectionTabs";
import { getChecklistFeed } from "../services/server/nonConformityFeedService";
import type { NonConformityItem } from "../types/nonConformity";
import type { ChecklistExecutionResponse } from "../types/execution";
import {
  MOCK_CLASS_NAMES,
  MOCK_NON_CONFORMITIES,
  MOCK_SUBMISSIONS,
} from "./nonConformityMockData";
import { PageChecklistNaoConformidadesContent } from "./PageChecklistNaoConformidadesContent";

/**
 * Fallback local se o gateway/checklist-backend não estiver no ar.
 * Com `false`, lista envios + issues reais (e "Ver Envio" usa o id real na #463).
 */
const USE_MOCK_DATA = false;

export async function PageChecklistNaoConformidades() {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <PermissionGate user={user} permission="checklist:gerenciar">
      <NaoConformidadesData
        token={token}
        isSenai={user?.userType === "SENAI"}
        sectionTabs={resolveChecklistSectionTabs(user)}
      />
    </PermissionGate>
  );
}

async function NaoConformidadesData({
  token,
  isSenai,
  sectionTabs,
}: {
  token: string;
  isSenai: boolean;
  sectionTabs: ReturnType<typeof resolveChecklistSectionTabs>;
}) {
  if (USE_MOCK_DATA) {
    return (
      <PageChecklistNaoConformidadesContent
        initialItems={MOCK_NON_CONFORMITIES}
        initialSubmissions={MOCK_SUBMISSIONS}
        classNames={MOCK_CLASS_NAMES}
        canValidate={isSenai}
        sectionTabs={sectionTabs}
        mockMode
      />
    );
  }

  let items: NonConformityItem[] = [];
  let submissions: ChecklistExecutionResponse[] = [];
  let classNames: Record<string, string> = {};
  let loadFailed = false;

  try {
    const [feed, classesResult] = await Promise.all([
      getChecklistFeed(0, 50),
      listClasses(token, { includeInactive: true }),
    ]);
    items = feed.nonConformities;
    submissions = feed.submissions;
    classNames = Object.fromEntries(
      classesResult.classes.map((clazz) => [clazz.id, clazz.name]),
    );
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.kind === "unauthorized") {
        redirect("/login");
      }
      // Gate real (ADR-0014): token com a permissão mas negado pelo back → 403
      // de verdade, não o estado de erro genérico do conteúdo.
      if (err.kind === "forbidden") {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />;
      }
    }
    loadFailed = true;
  }

  return (
    <PageChecklistNaoConformidadesContent
      initialItems={items}
      initialSubmissions={submissions}
      classNames={classNames}
      canValidate={isSenai}
      sectionTabs={sectionTabs}
      initialError={loadFailed}
    />
  );
}

export default PageChecklistNaoConformidades;
