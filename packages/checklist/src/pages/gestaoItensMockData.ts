export interface MockTemplateItem {
  key: string;
  title: string;
  description?: string;
}

/**
 * Itens do template de checklist mostrados em `/checklist/gestao-itens/[roomId]`
 * (tela de gestão — editar/excluir/adicionar item). Mesma lista mockada pra
 * qualquer sala com template, até existir edição real de template ativo
 * (precisa de fluxo de versionamento — new-version → editar DRAFT → ativar;
 * `editTemplate` do backend rejeita edição direta em template ACTIVE).
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
