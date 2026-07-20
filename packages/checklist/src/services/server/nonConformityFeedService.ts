import { listExecutions } from "./executionService";
import type { NonConformityItem } from "../../types/nonConformity";
import type { ChecklistExecutionResponse } from "../../types/execution";

export interface ChecklistFeed {
  /** Todas as execuções da página — vira a seção "Envios". */
  submissions: ChecklistExecutionResponse[];
  /** Só o par issue+execução das execuções com pendência — seção "Não conformidades". */
  nonConformities: NonConformityItem[];
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

  const nonConformities = result.content
    .filter((execution) => execution.issues.length > 0)
    .flatMap((execution) =>
      execution.issues.map((issue) => ({ issue, execution })),
    );

  return { submissions: result.content, nonConformities };
}
