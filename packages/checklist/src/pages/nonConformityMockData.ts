import type { ChecklistExecutionResponse } from "../types/execution";
import type { NonConformityItem } from "../types/nonConformity";

/**
 * Dados mockados pra testar a tela sem o backend no ar. Usados só quando
 * `USE_MOCK_DATA = true` em `PageChecklistNaoConformidades.tsx` — reverta essa
 * flag pra `false` assim que a API (`API_GATEWAY_URL`) estiver disponível.
 *
 * Cobre os 4 status que geram ação no `ChecklistNonConformityCard` (OPEN,
 * IN_PROGRESS, RESOLVED, REOPENED) e uma execução sem pendência, pra também
 * exercitar a seção "Envios" com um item de botão azul (sem não conformidade).
 */
function execution(
  overrides: Partial<ChecklistExecutionResponse> &
    Pick<ChecklistExecutionResponse, "id">,
): ChecklistExecutionResponse {
  return {
    templateId: "tpl-mock",
    templateVersion: 1,
    roomId: "sala-mock-0000",
    classId: "class-mock-1",
    filledBy: "user-mock-1",
    period: "MORNING",
    checklistType: "ARRIVAL",
    status: "SUBMITTED",
    complianceScore: 80,
    answersJson: {
      answers: [],
      summary: {
        totalItems: 5,
        answeredItems: 5,
        compliantItems: 4,
        nonCompliantItems: 1,
      },
    },
    summary: {
      totalItems: 5,
      answeredItems: 5,
      compliantItems: 4,
      nonCompliantItems: 1,
    },
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    issues: [],
    ...overrides,
  };
}

export const MOCK_CLASS_NAMES: Record<string, string> = {
  "class-mock-1": "MIDS-78",
  "class-mock-2": "DSAI-42",
};

export const MOCK_EXECUTION_OPEN = execution({
  id: "exec-mock-open",
  roomId: "sala-mock-0101",
  issues: [
    {
      id: "issue-mock-open",
      executionId: "exec-mock-open",
      itemKey: "quadro",
      itemTitleSnapshot: "Quadro",
      assignedTo: "user-mock-2",
      title: "Quadro sujo",
      description: "O quadro estava com marcas de caneta permanente.",
      status: "OPEN",
      priority: "MEDIUM",
      dueAt: new Date().toISOString(),
    },
  ],
});

export const MOCK_EXECUTION_IN_PROGRESS = execution({
  id: "exec-mock-in-progress",
  roomId: "sala-mock-0102",
  classId: "class-mock-2",
  checklistType: "POST_BREAK",
  issues: [
    {
      id: "issue-mock-in-progress",
      executionId: "exec-mock-in-progress",
      itemKey: "iluminacao",
      itemTitleSnapshot: "Iluminação",
      assignedTo: "user-mock-2",
      title: "Lâmpada queimada",
      description: "3 lâmpadas queimadas no fundo da sala.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueAt: new Date().toISOString(),
    },
  ],
});

export const MOCK_EXECUTION_RESOLVED = execution({
  id: "exec-mock-resolved",
  roomId: "sala-mock-0103",
  issues: [
    {
      id: "issue-mock-resolved",
      executionId: "exec-mock-resolved",
      itemKey: "internet",
      itemTitleSnapshot: "Rede/Internet",
      assignedTo: "user-mock-2",
      title: "Computadores sem rede",
      description:
        "3 computadores não conectavam à internet — cabo de rede substituído.",
      status: "RESOLVED",
      priority: "HIGH",
      dueAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
    },
  ],
});

export const MOCK_EXECUTION_REOPENED = execution({
  id: "exec-mock-reopened",
  roomId: "sala-mock-0104",
  classId: "class-mock-2",
  issues: [
    {
      id: "issue-mock-reopened",
      executionId: "exec-mock-reopened",
      itemKey: "cadeiras",
      itemTitleSnapshot: "Mobiliário",
      assignedTo: "user-mock-2",
      title: "Cadeiras quebradas",
      description:
        "2 cadeiras com pé solto — reaberto porque o problema persistiu após o conserto.",
      status: "REOPENED",
      priority: "MEDIUM",
      dueAt: new Date().toISOString(),
    },
  ],
});

export const MOCK_EXECUTION_COMPLIANT = execution({
  id: "exec-mock-compliant",
  roomId: "sala-mock-0105",
  complianceScore: 100,
  summary: {
    totalItems: 5,
    answeredItems: 5,
    compliantItems: 5,
    nonCompliantItems: 0,
  },
});

export const MOCK_SUBMISSIONS: ChecklistExecutionResponse[] = [
  MOCK_EXECUTION_OPEN,
  MOCK_EXECUTION_IN_PROGRESS,
  MOCK_EXECUTION_RESOLVED,
  MOCK_EXECUTION_REOPENED,
  MOCK_EXECUTION_COMPLIANT,
];

export const MOCK_NON_CONFORMITIES: NonConformityItem[] =
  MOCK_SUBMISSIONS.flatMap((execution) =>
    execution.issues.map((issue) => ({ issue, execution })),
  );
