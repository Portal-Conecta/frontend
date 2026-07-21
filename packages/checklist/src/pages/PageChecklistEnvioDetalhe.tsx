/**
 * PageChecklistEnvioDetalhe — detalhe de um envio de checklist, aberto a
 * partir do botão "Ver Envio" em `ChecklistSubmissionCard`
 * (`/checklist/nao-conformidades/envios/[id]`). Lista todos os itens
 * respondidos (conforme/não conforme + observação), não só as não
 * conformidades. Server Component: mesmo gate de RBAC das outras páginas do
 * domínio (`checklist:gerenciar`).
 *
 * Dados reais via `getExecutionDetail(id)`:
 * - GET `/api/checklist-executions/{id}` (execução + respostas)
 * - GET template da execução (títulos dos itens)
 * - GET `/api/checklist-issues/execution/{id}` (`ChecklistIssueController`)
 *
 * `USE_MOCK_DATA` fica como fallback local se o gateway não estiver no ar.
 */
import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { HttpError } from "@portal/core/http/errors";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";
import { PermissionGate } from "@portal/core";
import { listClasses } from "@portal/core/classes/classesService";
import { ErrorPage, Icon, Text } from "@portal/ui";

import { ChecklistItemResult } from "../components/ChecklistItemResult";
import { getExecutionDetail } from "../services/server/executionDetailService";
import type { ChecklistExecutionDetailItem } from "../types/executionDetail";
import type { ChecklistExecutionResponse } from "../types/execution";
import {
  MOCK_CLASS_NAMES,
  MOCK_EXECUTION_DETAIL_ITEMS,
  MOCK_SUBMISSIONS,
} from "./nonConformityMockData";

const USE_MOCK_DATA = false;

const CHECKLIST_TYPE_LABEL: Record<string, string> = {
  ARRIVAL: "Checklist de chegada",
  POST_BREAK: "Checklist pós-intervalo",
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export interface PageChecklistEnvioDetalheProps {
  id: string;
}

export async function PageChecklistEnvioDetalhe({
  id,
}: PageChecklistEnvioDetalheProps) {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <PermissionGate user={user} permission="checklist:gerenciar">
      <EnvioDetalheData id={id} token={token} />
    </PermissionGate>
  );
}

async function EnvioDetalheData({ id, token }: { id: string; token: string }) {
  let execution: ChecklistExecutionResponse | undefined;
  let items: ChecklistExecutionDetailItem[] = [];
  let className: string | undefined;
  let loadFailed = false;

  if (USE_MOCK_DATA) {
    execution =
      MOCK_SUBMISSIONS.find((mock) => mock.id === id) ?? MOCK_SUBMISSIONS[0];
    items = MOCK_EXECUTION_DETAIL_ITEMS;
    className = execution ? MOCK_CLASS_NAMES[execution.classId] : undefined;
  } else {
    try {
      const [detail, classesResult] = await Promise.all([
        getExecutionDetail(id),
        listClasses(token, { includeInactive: true }),
      ]);
      execution = detail.execution;
      items = detail.items;
      className = classesResult.classes.find(
        (clazz) => clazz.id === execution?.classId,
      )?.name;
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.kind === "unauthorized") {
          redirect("/login");
        }
        if (err.kind === "forbidden") {
          return <ErrorPage {...ERROR_PRESENTATION.forbidden} />;
        }
        if (err.kind === "not_found") {
          return <ErrorPage {...ERROR_PRESENTATION.not_found} />;
        }
      }
      loadFailed = true;
    }
  }

  if (loadFailed || !execution) {
    return <ErrorPage {...ERROR_PRESENTATION.server} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-3 md:gap-2">
        <Link
          href="/checklist/nao-conformidades"
          className="flex items-center gap-2 self-start"
        >
          <Icon name="chevron-left" size="lg" tone="primary" decorative />
          <Text
            as="h1"
            variant="label-md-emphasis"
            tone="brand"
            className="md:text-heading-h2"
          >
            {CHECKLIST_TYPE_LABEL[execution.checklistType] ??
              execution.checklistType}
          </Text>
        </Link>

        {/* Mobile: "Enviado dia" + Sala/Turma/Preenchido numa única caixa cinza. */}
        <div className="flex flex-col gap-1 rounded-md bg-background-default p-3 md:hidden">
          <Text variant="label-xs" tone="brand">
            Enviado dia{" "}
            {formatDateTime(execution.submittedAt ?? execution.startedAt)}
          </Text>
          <Text variant="label-xs" className="text-interactive-pressed">
            Sala: {execution.roomLabel ?? "—"}
          </Text>
          <Text variant="label-xs" className="text-interactive-pressed">
            Turma: {execution.className ?? className ?? "—"}
          </Text>
          <Text variant="label-xs" className="text-interactive-pressed">
            Preenchido por: {execution.filledByName ?? "—"}
          </Text>
        </div>

        {/* Desktop: "Enviado dia" sem fundo, separado da linha Sala/Turma/Preenchido —
            pl-10 (40px) alinha com o mesmo recuo do título (ícone 32px + gap-2 8px). */}
        <Text
          variant="label-md-emphasis"
          tone="brand"
          className="hidden md:block md:pl-10"
        >
          Enviado dia{" "}
          {formatDateTime(execution.submittedAt ?? execution.startedAt)}
        </Text>
      </div>

      {/* Desktop: Sala/Turma/Preenchido em linha, sem fundo, mesmo recuo do título. */}
      <div className="hidden items-center gap-x-6 md:flex md:pl-10">
        <Text variant="label-md" className="text-interactive-pressed">
          Sala: {execution.roomLabel ?? "—"}
        </Text>
        <Text variant="label-md" className="text-interactive-pressed">
          Turma: {execution.className ?? className ?? "—"}
        </Text>
        <Text variant="label-md" className="text-interactive-pressed">
          Preenchido por: {execution.filledByName ?? "—"}
        </Text>
      </div>

      <div>
        {items.map((item) => (
          <ChecklistItemResult
            key={item.key}
            title={item.title}
            status={item.compliant ? "conforme" : "nao-conforme"}
            {...(item.description ? { description: item.description } : {})}
            {...(item.observation ? { observation: item.observation } : {})}
          />
        ))}
      </div>
    </div>
  );
}

export default PageChecklistEnvioDetalhe;
