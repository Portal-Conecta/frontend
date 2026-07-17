import { createHttpClient } from "@portal/core/http/httpClient";
import { checklistGatewayPath } from "../checklistGateway";
import type { StatsEntry, DashboardStatsResponse } from "../../types/stats";

// Cria o client HTTP apontando para a variável de ambiente do Gateway
const http = createHttpClient("API_GATEWAY_URL");

/**
 * Função genérica pros 14 endpoints "simples" de stats (todos GET, sem
 * corpo, retornam StatsEntry[]). Passe o path exatamente como aparece na
 * tabela do documento (sem o /api, ele completa sozinho).
 *
 * Exemplo de uso:
 *   await getStatsEntries('/api/checklist-executions/stats/completion-rate')
 */
export async function getStatsEntries(
  servicePath: string,
): Promise<StatsEntry[]> {
  return http.get<StatsEntry[]>(checklistGatewayPath(servicePath));
}

/** Dashboard composto — único endpoint de stats com parâmetros e shape próprio. */
export async function getDashboardStats(
  from?: string,
  to?: string,
): Promise<DashboardStatsResponse> {
  return http.get<DashboardStatsResponse>(
    checklistGatewayPath("/api/checklist-stats/dashboard"),
    { params: { from, to } },
  );
}
