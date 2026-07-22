"use client";

import { useEffect, useState } from "react";

import { listSubmissionWindowsByClassClient } from "../services/client/submissionWindowClient";
import { resolveChecklistType } from "../utils/submissionWindow";
import type { ChecklistType } from "../types/submissionWindow";

/**
 * Resolve o tipo de checklist (Entrada/Pós-Intervalo) da turma a partir das
 * janelas configuradas — aberta ou não. `hasWindow=false` significa que a turma
 * não tem janela nenhuma (não é preenchível). A validação do horário em si
 * acontece só no envio (backend), não aqui.
 *
 * `classId` nulo (turma ainda não escolhida) não busca nada — devolve o
 * estado neutro, sem `loading`.
 */
export function useClassChecklistType(classId: string | null) {
  const [checklistType, setChecklistType] = useState<ChecklistType | null>(null);
  const [hasWindow, setHasWindow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId) {
      setChecklistType(null);
      setHasWindow(false);
      setError("");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const windows = await listSubmissionWindowsByClassClient(classId!);
        if (cancelled) return;
        setHasWindow(windows.length > 0);
        setChecklistType(resolveChecklistType(windows));
      } catch {
        if (!cancelled) setError("Não foi possível carregar a janela de preenchimento.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  return { checklistType, hasWindow, loading, error };
}
