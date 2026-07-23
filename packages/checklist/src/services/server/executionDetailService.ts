import { findExecutionById } from "./executionService";
import { findTemplateById } from "./templateService";
import { listIssuesByExecution } from "./issueService";
import type { ChecklistExecutionResponse } from "../../types/execution";
import type { ChecklistExecutionDetailItem } from "../../types/executionDetail";
import type { ChecklistIssueResponse } from "../../types/issue";

export interface ChecklistExecutionDetail {
  execution: ChecklistExecutionResponse;
  items: ChecklistExecutionDetailItem[];
  /** Issues da execução via GET `/api/checklist-issues/execution/{id}`. */
  issues: ChecklistIssueResponse[];
}

/**
 * Busca a execução, o template e as issues do checklist e monta a lista de
 * itens do detalhe do envio (`/checklist/nao-conformidades/envios/[id]`).
 *
 * - Execução: `itemKey` + resposta em `answersJson.answers`
 * - Template: título/descrição em `schemaJson.sections[].items[]`
 * - Issues: GET `ChecklistIssueController` `/api/checklist-issues/execution/{id}`
 *   — enriquece não conformes com `description` quando o schema ou a
 *   observation da answer estiverem vazios
 */
export async function getExecutionDetail(
  executionId: string,
): Promise<ChecklistExecutionDetail> {
  const execution = await findExecutionById(executionId);

  const [template, issues] = await Promise.all([
    findTemplateById(execution.templateId),
    listIssuesByExecution(executionId),
  ]);

  const itemsByKey = new Map(
    template.schemaJson.sections.flatMap((section) =>
      section.items.map((item) => [item.key, item] as const),
    ),
  );

  const issuesByItemKey = new Map(
    issues.map((issue) => [issue.itemKey, issue] as const),
  );

  const answers = execution.answersJson?.answers ?? [];

  let items: ChecklistExecutionDetailItem[] = answers.map((answer) => {
    const schemaItem = itemsByKey.get(answer.itemKey);
    const issue = issuesByItemKey.get(answer.itemKey);

    const title = schemaItem?.title ?? answer.itemKey;
    const description = schemaItem?.description ?? issue?.title;
    const observation = answer.observation ?? issue?.description;

    return {
      key: answer.itemKey,
      title,
      ...(description ? { description } : {}),
      compliant: answer.compliant,
      ...(observation ? { observation } : {}),
    };
  });

  // Fallback: se a execução não trouxer answers mas houver issues no GET,
  // monta a lista só com as não conformidades (ainda útil pro supervisor).
  if (items.length === 0 && issues.length > 0) {
    items = issues.map((issue) => {
      const schemaItem = itemsByKey.get(issue.itemKey);
      return {
        key: issue.itemKey,
        title: schemaItem?.title ?? issue.itemKey,
        ...(schemaItem?.description
          ? { description: schemaItem.description }
          : issue.title
            ? { description: issue.title }
            : {}),
        compliant: false,
        ...(issue.description ? { observation: issue.description } : {}),
      };
    });
  }

  return { execution, items, issues };
}
