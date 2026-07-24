"use client";

import { useEffect, useState } from "react";

import { listSubmissionWindowsByClassClient } from "../services/client/submissionWindowClient";
import { findOpenChecklistType, resolveChecklistType } from "../utils/submissionWindow";
import type { ChecklistType } from "../types/submissionWindow";

/**
 * Resolve o tipo de checklist (Entrada/Pós-Intervalo) da turma a partir das
 * janelas configuradas. `hasWindow=false` significa que a turma não tem
 * janela nenhuma configurada; `isOpenNow=false` significa que existe janela,
 * mas nenhuma está aberta no horário atual — nos dois casos o preenchimento
 * fica bloqueado (ver `isSubmissionUnavailable` em `FillChecklistPage`). O
 * backend valida o horário de novo no envio (fonte da verdade); aqui é só
 * pra não deixar preencher uma checklist que o backend vai recusar.
 *
 * `classId` nulo (turma ainda não escolhida) não busca nada — devolve o
 * estado neutro, sem `loading`.
 */
export function useClassChecklistType(classId: string | null) {
  const [checklistType, setChecklistType] = useState<ChecklistType | null>(
    null,
  );
  const [hasWindow, setHasWindow] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId) {
      setChecklistType(null);
      setHasWindow(false);
      setIsOpenNow(false);
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
        setIsOpenNow(findOpenChecklistType(windows) !== null);
      } catch {
        if (!cancelled)
          setError("Não foi possível carregar a janela de preenchimento.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  return { checklistType, hasWindow, isOpenNow, loading, error };
}
