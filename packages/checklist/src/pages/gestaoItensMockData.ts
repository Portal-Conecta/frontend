export interface MockChecklistRoom {
  id: string;
  room: string;
  hasChecklist: boolean;
}

/**
 * Dados mockados pra `/checklist/gestao-itens` enquanto não existe um endpoint
 * que liste todas as salas (hoje `listTemplates()` só retorna salas que já têm
 * template — não serve pra esta tela, que precisa listar TODAS as salas).
 * Reverta `USE_MOCK_DATA` pra `false` em `PageChecklistGestaoItens.tsx` assim
 * que esse endpoint existir.
 */
export const MOCK_CHECKLIST_ROOMS: MockChecklistRoom[] = [
  { id: "room-001", room: "Sala 101", hasChecklist: true },
  { id: "room-002", room: "Sala 102", hasChecklist: false },
  { id: "room-003", room: "Sala 103", hasChecklist: true },
  { id: "room-004", room: "Sala 104", hasChecklist: false },
  { id: "room-005", room: "Sala 105", hasChecklist: true },
  { id: "room-006", room: "Laboratório de Informática 1", hasChecklist: false },
  { id: "room-007", room: "Laboratório de Informática 2", hasChecklist: true },
  { id: "room-008", room: "Auditório", hasChecklist: false },
  { id: "room-009", room: "Biblioteca", hasChecklist: true },
  { id: "room-010", room: "Sala 106", hasChecklist: false },
];

export interface MockTemplateItem {
  key: string;
  title: string;
  description?: string;
}

/**
 * Itens do template de checklist mostrados em `/checklist/gestao-itens/[roomId]`
 * (tela de gestão — editar/excluir/adicionar item). Mesma lista mockada pra
 * qualquer sala com `hasChecklist: true`, até existir o endpoint real
 * (`findTemplateById`/`editTemplate` em `templateService.ts` já cobrem o
 * contrato — falta só a busca do template pelo `roomId`).
 */
export const MOCK_TEMPLATE_ITEMS: MockTemplateItem[] = [
  {
    key: "porta",
    title: "Porta",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    key: "janelas",
    title: "Janelas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    key: "ar-condicionado",
    title: "Ar condicionado",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    key: "computadores",
    title: "Computadores",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    key: "limpeza-organizacao",
    title: "Limpeza e organização",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    key: "perifericos",
    title: "Perifericos",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    key: "iluminacao",
    title: "Iluminação",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];
