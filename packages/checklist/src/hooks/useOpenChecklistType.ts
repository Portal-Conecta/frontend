"use client";

import { useEffect, useState } from "react";

import { listSubmissionWindowsByClassClient } from "../services/client/submissionWindowClient";
import { findOpenChecklistType } from "../utils/submissionWindow";
import type { ChecklistType } from "../types/submissionWindow";

/** Descobre qual `checklistType` está com a janela de submissão aberta agora, pra turma informada. */
export function useOpenChecklistType(classId: string) {
  const [checklistType, setChecklistType] = useState<ChecklistType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const windows = await listSubmissionWindowsByClassClient(classId);
        if (!cancelled) setChecklistType(findOpenChecklistType(windows));
      } catch {
        if (!cancelled)
          setError("Não foi possível verificar o horário de preenchimento.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  return { checklistType, loading, error };
}
