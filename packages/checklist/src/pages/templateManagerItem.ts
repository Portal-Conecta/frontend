/**
 * Item exibido em `/checklist/gestao-itens/[roomId]` (tela de gestão —
 * editar/excluir/adicionar item). Vem do `schemaJson` do template ativo real
 * da sala (`PageChecklistTemplateManager`) ou vazio ao criar (`PageChecklistTemplateCreate`).
 */
export interface TemplateManagerItem {
  key: string;
  title: string;
  description?: string;
  /** Preservados do item original — não têm campo na UI, mas não podem ser perdidos ao salvar. */
  answerType?: "CONFORMITY" | "TEXT" | "NUMBER";
  required?: boolean;
  category?: string;
}
