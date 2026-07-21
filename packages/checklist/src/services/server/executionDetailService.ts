import { findExecutionById } from "./executionService";
import { findTemplateById } from "./templateService";
import type { ChecklistExecutionResponse } from "../../types/execution";
import type { ChecklistExecutionDetailItem } from "../../types/executionDetail";

export interface ChecklistExecutionDetail {
  execution: ChecklistExecutionResponse;
  items: ChecklistExecutionDetailItem[];
}

/**
 * Busca a execução e o template do checklist e junta os dois: a execução só
 * guarda `itemKey` + resposta em `answersJson.answers`, o título/descrição de
 * cada item vem do schema do template (`schemaJson.sections[].items[]`).
 */
export async function getExecutionDetail(
  executionId: string,
): Promise<ChecklistExecutionDetail> {
  const execution = await findExecutionById(executionId);
  const template = await findTemplateById(execution.templateId);

  const itemsByKey = new Map(
    template.schemaJson.sections.flatMap((section) =>
      section.items.map((item) => [item.key, item] as const),
    ),
  );

  const items: ChecklistExecutionDetailItem[] =
    execution.answersJson.answers.map((answer) => {
      const schemaItem = itemsByKey.get(answer.itemKey);
      return {
        key: answer.itemKey,
        title: schemaItem?.title ?? answer.itemKey,
        ...(schemaItem?.description
          ? { description: schemaItem.description }
          : {}),
        compliant: answer.compliant,
        ...(answer.observation ? { observation: answer.observation } : {}),
      };
    });

  return { execution, items };
}
