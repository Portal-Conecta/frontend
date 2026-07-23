"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { bffFetch } from "@portal/core/http/bffClient";
import { HttpError } from "@portal/core/http/errors";
import {
  Banner,
  Button,
  EmptyState,
  Icon,
  Text,
  type SelectOption,
} from "@portal/ui";

import type { SectionTab } from "../components/SectionTabs";
import { SectionTabs } from "../components/SectionTabs";
import {
  ChecklistFilters,
  type ChecklistFiltersValues,
} from "../components/ChecklistFilters";
import {
  ChecklistNonConformityCard,
  ChecklistNonConformityListHeader,
} from "../components/ChecklistNonConformityCard";
import {
  ChecklistSubmissionCard,
  ChecklistSubmissionListHeader,
} from "../components/ChecklistSubmissionCard";
import type { NonConformityItem } from "../types/nonConformity";
import type { ChecklistIssueResponse } from "../types/issue";
import type { ChecklistExecutionResponse } from "../types/execution";
import { formatRoomLabel } from "../utils/roomLabel";

export interface PageChecklistNaoConformidadesContentProps {
  initialItems: NonConformityItem[];
  /** Todas as execuções da página — seção "Envios" (conforme ou não). */
  initialSubmissions: ChecklistExecutionResponse[];
  /** `classId -> nome da turma`, resolvido no servidor (`listClasses`). */
  classNames: Record<string, string>;
  /** Só o coordenador SENAI vê "Validar"/"Reabrir" (backend rejeita os demais). */
  canValidate: boolean;
  /** Abas do módulo já resolvidas por papel (`resolveChecklistSectionTabs`). */
  sectionTabs: readonly SectionTab[];
  initialError?: boolean;
  /** TEMPORÁRIO: com dados mockados as ações só atualizam o estado local, sem chamar a API. */
  mockMode?: boolean;
}

/** Espelha a máquina de estados do issueService.ts pro modo mock (sem backend). */
const MOCK_TRANSITIONS: Record<string, ChecklistIssueResponse["status"]> = {
  start: "IN_PROGRESS",
  resolve: "RESOLVED",
  validate: "VALIDATED",
  reopen: "REOPENED",
  "restart-progress": "IN_PROGRESS",
  cancel: "CANCELED",
};

const CHECKLIST_TYPE_LABEL: Record<string, string> = {
  ARRIVAL: "Checklist de chegada",
  POST_BREAK: "Checklist pós-intervalo",
};

const PERIOD_TO_DAYS: Record<string, number> = {
  ontem: 1,
  "3-dias": 3,
  "7-dias": 7,
  "1-mes": 30,
  "3-meses": 90,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(iso: string): string {
  return `${formatDate(iso)} às ${formatTime(iso)}`;
}

/** Ação de transição de status de uma issue (`start`, `resolve`, `validate`...). */
async function transitionIssue(
  issueId: string,
  action: string,
): Promise<ChecklistIssueResponse> {
  return bffFetch<ChecklistIssueResponse>(
    `/api/checklist/issues/${issueId}/${action}`,
    {
      method: "PATCH",
    },
  );
}

interface CollapsibleSectionFilterApi {
  /** Fecha o painel de filtros no mobile (ex.: após Aplicar). */
  closeFilters: () => void;
}

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  /**
   * Filtros da seção. No mobile o painel fica oculto e só o ícone (funil)
   * ao lado do título abre; no desktop (md+) os filtros ficam sempre visíveis.
   */
  filters?: (api: CollapsibleSectionFilterApi) => ReactNode;
  children: ReactNode;
  className?: string;
}

/** Título clicável que expande/recolhe o conteúdo — mesma animação de grid-rows do ChecklistNonConformityCard. */
function CollapsibleSection({
  title,
  defaultOpen = true,
  filters,
  children,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const panelId = useId();
  const filtersPanelId = useId();

  const closeFilters = () => setFiltersOpen(false);

  return (
    <section className={className}>
      {/* gap-10 = 40px entre o título (Envios) e o ícone de filtro */}
      <div className="flex items-center gap-10">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex items-center gap-2"
        >
          <Icon
            name={open ? "chevron-down" : "chevron-up"}
            size="lg"
            tone="primary"
            decorative
          />
          <Text
            as="span"
            variant="label-md-emphasis"
            tone="brand"
            className="lg:text-heading-h2"
          >
            {title}
          </Text>
        </button>

        {filters ? (
          <Button
            variant="outlined"
            size="sm"
            aria-label={filtersOpen ? "Fechar filtros" : "Abrir filtros"}
            aria-expanded={filtersOpen}
            aria-controls={filtersPanelId}
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={[
              "!rounded-full !px-4 !py-2 md:hidden",
              // Aberto / selecionado: fundo interactive-pressed.
              filtersOpen
                ? "!border-interactive-pressed !bg-interactive-pressed !text-text-inverse"
                : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* sm = 16px (icon-only do Button sm usa 24px por padrão) */}
            {filtersOpen ? (
              <Icon name="funnel" size="sm" decorative tone="inverse" />
            ) : (
              <Icon name="funnel" size="sm" decorative />
            )}
          </Button>
        ) : null}
      </div>

      <div
        id={panelId}
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden pt-4">
          {filters ? (
            <div
              id={filtersPanelId}
              className={[
                "mb-4",
                // Mobile: só com o funil; desktop: sempre visível.
                filtersOpen ? "block" : "hidden",
                "md:block",
              ].join(" ")}
            >
              {filters({ closeFilters })}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}

export function PageChecklistNaoConformidadesContent({
  initialItems,
  initialSubmissions,
  classNames,
  canValidate,
  sectionTabs,
  initialError = false,
  mockMode = false,
}: PageChecklistNaoConformidadesContentProps) {
  const router = useRouter();

  const [items, setItems] = useState(initialItems);
  const [submissions] = useState(initialSubmissions);
  const [error, setError] = useState(initialError);
  const [pendingIssueId, setPendingIssueId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChecklistFiltersValues>({});
  const [submissionFilters, setSubmissionFilters] =
    useState<ChecklistFiltersValues>({});

  const roomOptions = useMemo<SelectOption[]>(() => {
    const byId = new Map<string, string>();
    for (const { execution } of items) {
      if (!byId.has(execution.roomId)) {
        byId.set(execution.roomId, formatRoomLabel(execution.room));
      }
    }
    return [...byId.entries()].map(([value, label]) => ({ value, label }));
  }, [items]);

  const groupOptions = useMemo<SelectOption[]>(() => {
    const byId = new Map<string, string>();
    for (const { execution } of items) {
      if (!byId.has(execution.classId)) {
        byId.set(
          execution.classId,
          execution.className ?? classNames[execution.classId] ?? "Turma",
        );
      }
    }
    return [...byId.entries()].map(([value, label]) => ({ value, label }));
  }, [items, classNames]);

  const filteredItems = useMemo(() => {
    const minDays = filters.period ? PERIOD_TO_DAYS[filters.period] : undefined;
    const cutoff = minDays
      ? Date.now() - minDays * 24 * 60 * 60 * 1000
      : undefined;

    return items.filter(({ issue, execution }) => {
      // Encerradas (CANCELED/VALIDATED) somem pra todo mundo; RESOLVED só
      // continua visível pra quem ainda tem ação nela (Validar/Reabrir).
      if (issue.status === "CANCELED" || issue.status === "VALIDATED")
        return false;
      if (issue.status === "RESOLVED" && !canValidate) return false;
      if (filters.room && execution.roomId !== filters.room) return false;
      if (filters.group && execution.classId !== filters.group) return false;
      if (cutoff && new Date(execution.startedAt).getTime() < cutoff)
        return false;
      return true;
    });
  }, [items, filters, canValidate]);

  const submissionRoomOptions = useMemo<SelectOption[]>(() => {
    const byId = new Map<string, string>();
    for (const execution of submissions) {
      if (!byId.has(execution.roomId)) {
        byId.set(execution.roomId, formatRoomLabel(execution.room));
      }
    }
    return [...byId.entries()].map(([value, label]) => ({ value, label }));
  }, [submissions]);

  const submissionGroupOptions = useMemo<SelectOption[]>(() => {
    const byId = new Map<string, string>();
    for (const execution of submissions) {
      if (!byId.has(execution.classId)) {
        byId.set(
          execution.classId,
          execution.className ?? classNames[execution.classId] ?? "Turma",
        );
      }
    }
    return [...byId.entries()].map(([value, label]) => ({ value, label }));
  }, [submissions, classNames]);

  const filteredSubmissions = useMemo(() => {
    const minDays = submissionFilters.period
      ? PERIOD_TO_DAYS[submissionFilters.period]
      : undefined;
    const cutoff = minDays
      ? Date.now() - minDays * 24 * 60 * 60 * 1000
      : undefined;

    return submissions.filter((execution) => {
      if (submissionFilters.room && execution.roomId !== submissionFilters.room)
        return false;
      if (
        submissionFilters.group &&
        execution.classId !== submissionFilters.group
      )
        return false;
      if (cutoff && new Date(execution.startedAt).getTime() < cutoff)
        return false;
      return true;
    });
  }, [submissions, submissionFilters]);

  function updateIssue(issueId: string, updated: ChecklistIssueResponse) {
    setItems((prev) =>
      prev.map((item) =>
        item.issue.id === issueId ? { ...item, issue: updated } : item,
      ),
    );
  }

  function handleAction(issueId: string, action: string) {
    if (mockMode) {
      const nextStatus = MOCK_TRANSITIONS[action];
      const current = items.find((item) => item.issue.id === issueId)?.issue;
      if (nextStatus && current)
        updateIssue(issueId, { ...current, status: nextStatus });
      return;
    }

    setPendingIssueId(issueId);
    transitionIssue(issueId, action)
      .then((updated) => updateIssue(issueId, updated))
      .catch((err) => {
        if (err instanceof HttpError && err.kind === "unauthorized") {
          router.replace("/login");
          return;
        }
        setError(true);
      })
      .finally(() => setPendingIssueId(null));
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <SectionTabs tabs={[...sectionTabs]} />

      <Text as="h1" variant="heading-h2" tone="brand" className="sr-only">
        Não Conformidades
      </Text>

      {error && (
        <Banner variant="error">
          Não foi possível carregar os dados do checklist.
        </Banner>
      )}

      <CollapsibleSection
        title="Envios"
        filters={({ closeFilters }) => (
          <ChecklistFilters
            roomOptions={submissionRoomOptions}
            groupOptions={submissionGroupOptions}
            onApply={(values) => {
              setSubmissionFilters(values);
              closeFilters();
            }}
            onReset={() => setSubmissionFilters({})}
          />
        )}
      >
        {filteredSubmissions.length === 0 ? (
          <EmptyState
            title="Nenhum envio encontrado"
            description="Ajuste os filtros ou tente um período diferente."
            illustration={
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-interactive-subtle text-interactive-default">
                <Icon name="clipboard-list" size="lg" decorative />
              </span>
            }
          />
        ) : (
          <div role="table" aria-label="Lista de envios">
            <ChecklistSubmissionListHeader />
            {filteredSubmissions.map((execution) => (
              <ChecklistSubmissionCard
                key={execution.id}
                room={formatRoomLabel(execution.room)}
                checklistType={
                  CHECKLIST_TYPE_LABEL[execution.checklistType] ??
                  execution.checklistType
                }
                submittedAt={
                  execution.submittedAt
                    ? formatDateTime(execution.submittedAt)
                    : formatDateTime(execution.startedAt)
                }
                group={
                  execution.className ??
                  classNames[execution.classId] ??
                  "Turma"
                }
                hasNonConformity={execution.issues.length > 0}
                onView={() =>
                  router.push(
                    `/checklist/nao-conformidades/envios/${execution.id}`,
                  )
                }
              />
            ))}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Não Conformidades"
        className="mt-10 border-t border-border-default pt-10"
        filters={({ closeFilters }) => (
          <ChecklistFilters
            roomOptions={roomOptions}
            groupOptions={groupOptions}
            onApply={(values) => {
              setFilters(values);
              closeFilters();
            }}
            onReset={() => setFilters({})}
          />
        )}
      >
        {filteredItems.length === 0 ? (
          <EmptyState
            title="Nenhuma não conformidade encontrada"
            description="Ajuste os filtros ou tente um período diferente."
            illustration={
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-interactive-subtle text-interactive-default">
                <Icon name="clipboard-list" size="lg" decorative />
              </span>
            }
          />
        ) : (
          <div role="table" aria-label="Lista de não conformidades">
            <ChecklistNonConformityListHeader />
            {filteredItems.map(({ issue, execution, itemTitle }) => (
              <ChecklistNonConformityCard
                key={issue.id}
                room={formatRoomLabel(execution.room)}
                category={itemTitle ?? issue.itemKey}
                submittedDate={formatDate(execution.startedAt)}
                submittedTime={formatTime(execution.startedAt)}
                group={
                  execution.className ??
                  classNames[execution.classId] ??
                  "Turma"
                }
                nonConformity={issue.description}
                status={issue.status}
                canValidate={canValidate}
                onStart={() => handleAction(issue.id, "start")}
                onResolve={() => handleAction(issue.id, "resolve")}
                onValidate={() => handleAction(issue.id, "validate")}
                onReopen={() => handleAction(issue.id, "reopen")}
                onRestartProgress={() =>
                  handleAction(issue.id, "restart-progress")
                }
                onCancel={() => handleAction(issue.id, "cancel")}
                pending={pendingIssueId === issue.id}
              />
            ))}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
