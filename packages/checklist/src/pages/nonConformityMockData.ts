import type { ChecklistExecutionResponse } from "../types/execution";
import type { ChecklistExecutionDetailItem } from "../types/executionDetail";
import type { NonConformityItem } from "../types/nonConformity";
import type {
  ChecklistTemplateResponse,
  RoomResponse,
} from "../types/template";

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

/** Itens da tela de detalhe do envio (`/checklist/nao-conformidades/envios/[id]`) — mesma lista pra qualquer execução mockada. */
export const MOCK_EXECUTION_DETAIL_ITEMS: ChecklistExecutionDetailItem[] = [
  {
    key: "ar-condicionado",
    title: "Ar Condicionado",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    compliant: true,
  },
  {
    key: "computadores",
    title: "Computadores",
    compliant: false,
    observation:
      "3 Computadores apresentam problemas para se conectar com a internet. Acho que os cabos de rede estão com algum mal contato.",
  },
  {
    key: "perifericos",
    title: "Periféricos",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    compliant: true,
  },
  {
    key: "mesas",
    title: "Mesas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    compliant: true,
  },
  {
    key: "cadeiras",
    title: "Cadeiras",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    compliant: true,
  },
  {
    key: "janelas",
    title: "Janelas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    compliant: true,
  },
  {
    key: "portas",
    title: "Portas",
    compliant: false,
  },
  {
    key: "paredes-piso",
    title: "Paredes e piso",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    compliant: true,
  },
];

/** Sala com indicação se já tem checklist ativo — `hasChecklist` não existe no `RoomResponse` do backend; decide qual botão (`RoomChecklistItem`) aparece. */
export type MockRoomWithChecklist = RoomResponse & { hasChecklist: boolean };

/** Salas para a tela de gestão de checklists (`/checklist/gestao-itens`). */
export const MOCK_CHECKLIST_ROOMS: MockRoomWithChecklist[] = [
  {
    id: "room-001",
    number: 101,
    typeRoom: "Sala de aula",
    status: "ACTIVE",
    hasChecklist: true,
  },
  {
    id: "room-002",
    number: 102,
    typeRoom: "Sala de aula",
    status: "ACTIVE",
    hasChecklist: true,
  },
  {
    id: "room-003",
    number: 103,
    typeRoom: "Sala de aula",
    status: "ACTIVE",
    hasChecklist: false,
  },
  {
    id: "room-004",
    number: 104,
    typeRoom: "Sala de aula",
    status: "ACTIVE",
    hasChecklist: true,
  },
  {
    id: "room-005",
    number: 105,
    typeRoom: "Sala de aula",
    status: "ACTIVE",
    hasChecklist: false,
  },
  {
    id: "room-006",
    number: 204,
    typeRoom: "Laboratório de informática",
    status: "ACTIVE",
    hasChecklist: true,
  },
  {
    id: "room-007",
    number: 205,
    typeRoom: "Laboratório de informática",
    status: "ACTIVE",
    hasChecklist: false,
  },
  {
    id: "room-008",
    number: 206,
    typeRoom: "Laboratório de eletrônica",
    status: "ACTIVE",
    hasChecklist: false,
  },
  {
    id: "room-009",
    number: 301,
    typeRoom: "Oficina",
    status: "ACTIVE",
    hasChecklist: true,
  },
  {
    id: "room-010",
    number: 302,
    typeRoom: "Auditório",
    status: "ACTIVE",
    hasChecklist: false,
  },
];

/** Checklists templates para a tela de gestão de itens (`/checklist/gestao-itens`). */
export const MOCK_CHECKLIST_ITEMS: ChecklistTemplateResponse[] = [
  {
    id: "tpl-arrival-001",
    roomId: "sala-mock-0000",
    title: "Checklist de Chegada",
    description: "Verificação de conformidade na chegada dos alunos",
    category: "GERAL",
    version: 3,
    status: "ACTIVE",
    active: true,
    schemaJson: {
      sections: [
        {
          key: "infraestrutura",
          title: "Infraestrutura",
          order: 1,
          items: [
            {
              key: "ar-condicionado",
              title: "Ar Condicionado",
              description: "Verificar funcionamento do ar condicionado",
              required: true,
              order: 1,
            },
            {
              key: "iluminacao",
              title: "Iluminação",
              description: "Verificar se todas as luzes estão funcionando",
              required: true,
              order: 2,
            },
          ],
        },
      ],
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tpl-postbreak-001",
    roomId: "sala-mock-0000",
    title: "Checklist Pós-Intervalo",
    description: "Verificação de conformidade após intervalo",
    category: "GERAL",
    version: 2,
    status: "ACTIVE",
    active: true,
    schemaJson: {
      sections: [
        {
          key: "limpeza",
          title: "Limpeza",
          order: 1,
          items: [
            {
              key: "piso",
              title: "Piso",
              description: "Verificar limpeza do piso",
              required: true,
              order: 1,
            },
            {
              key: "lousa",
              title: "Lousa/Quadro",
              description: "Verificar se o quadro foi limpo",
              required: true,
              order: 2,
            },
          ],
        },
      ],
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tpl-equipment-001",
    roomId: "sala-mock-0000",
    title: "Checklist de Equipamentos",
    description: "Verificação de equipamentos eletrônicos",
    category: "ELETRONICOS",
    version: 1,
    status: "DRAFT",
    active: false,
    schemaJson: {
      sections: [
        {
          key: "computadores",
          title: "Computadores",
          order: 1,
          items: [
            {
              key: "liga-desliga",
              title: "Liga/Desliga",
              description: "Verificar se os computadores ligam",
              required: true,
              order: 1,
            },
          ],
        },
      ],
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
