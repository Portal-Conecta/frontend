import type { ChecklistIssueResponse } from "./issue";
import type { ChecklistExecutionResponse } from "./execution";

/**
 * Uma pendência (issue) com o contexto da execução que a gerou — o par que o
 * Painel de Não Conformidades precisa pra montar cada `ChecklistNonConformityCard`.
 */
export interface NonConformityItem {
  issue: ChecklistIssueResponse;
  execution: ChecklistExecutionResponse;
  /** Título do item no template (`schemaJson`) — a issue não guarda mais um snapshot disso. */
  itemTitle?: string;
}
