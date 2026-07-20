// packages/checklist/src/services/client/templateClient.ts
import { bffFetch } from "@portal/core/http/bffClient";
import { buildQuery, type QueryParams } from "@portal/core/http/query";

import type { ChecklistTemplateResponse } from "../../types/template";

/** Busca via BFF (`GET /api/checklist/templates`) o template ACTIVE de uma sala. */
export async function findActiveTemplateByRoom(
  roomId: string,
): Promise<ChecklistTemplateResponse | null> {
  const templates = await bffFetch<ChecklistTemplateResponse[]>(
    `/api/checklist/templates${buildQuery({ roomId, status: "ACTIVE" } as QueryParams)}`,
  );
  return templates[0] ?? null;
}