import { listExecutions } from "./executionService";
import { findTemplateById } from "./templateService";
import type { NonConformityItem } from "../../types/nonConformity";
import type { ChecklistExecutionResponse } from "../../types/execution";

export interface ChecklistFeed {
  /** Todas as execuções da página — vira a seção "Envios". */
  submissions: ChecklistExecutionResponse[];
  /** Só o par issue+execução das execuções com pendência — seção "Não conformidades". */
  nonConformities: NonConformityItem[];
}

/**
 * `itemKey -> title` de um template, pra resolver o nome do item de cada
 * issue (a issue só guarda `itemKey`, não um título legível).
 */
async function titlesByTemplateId(
  templateIds: string[],
): Promise<Map<string, Map<string, string>>> {
  const templates = await Promise.all(
    templateIds.map((id) => findTemplateById(id).catch(() => null)),
  );

  return new Map(
    templates
      .filter((template) => template !== null)
      .map((template) => [
        template.id,
        new Map(
          template.schemaJson.sections.flatMap((section) =>
            section.items.map((item) => [item.key, item.title] as const),
          ),
        ),
      ]),
  );
}

/**
 * Busca as execuções mais recentes uma única vez e deriva as duas seções da
 * tela ("Envios" e "Não conformidades registradas") do mesmo resultado — evita
 * duas chamadas a `GET /api/checklist-executions` pro mesmo dado.
 */
export async function getChecklistFeed(
  page = 0,
  size = 20,
): Promise<ChecklistFeed> {
  const result = await listExecutions(page, size);

  // Rascunhos (DRAFT) nunca foram enviados de fato — não pertencem a "Envios".
  const submitted = result.content.filter(
    (execution) => execution.status === "SUBMITTED",
  );

  const withIssues = submitted.filter(
    (execution) => execution.issues.length > 0,
  );

  const templateIds = [
    ...new Set(withIssues.map((execution) => execution.templateId)),
  ];
  const itemTitles = await titlesByTemplateId(templateIds);

  const nonConformities = withIssues.flatMap((execution) =>
    execution.issues.map((issue) => {
      const itemTitle = itemTitles
        .get(execution.templateId)
        ?.get(issue.itemKey);
      return { issue, execution, ...(itemTitle ? { itemTitle } : {}) };
    }),
  );

  return { submissions: submitted, nonConformities };
}
