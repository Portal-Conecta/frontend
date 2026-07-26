"use client";

import { useEffect, useState } from "react";

import { listSubmissionWindowsByClassClient } from "../services/client/submissionWindowClient";
import { findOpenChecklistType, resolveChecklistType } from "../utils/submissionWindow";
import type { SubmissionWindowResponse } from "../types/submissionWindow";

const WINDOW_CLOCK_REFRESH_MS = 1_000;

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
  const [windows, setWindows] = useState<SubmissionWindowResponse[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId) {
      setWindows([]);
      setError("");
      return;
    }

    let cancelled = false;
    setWindows([]);

    async function load() {
      setLoading(true);
      setError("");
      try {
        const windows = await listSubmissionWindowsByClassClient(classId!);
        if (cancelled) return;
        setWindows(windows);
        setNow(new Date());
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

  useEffect(() => {
    if (!classId) return;

    const refreshClock = () => setNow(new Date());
    const intervalId = window.setInterval(
      refreshClock,
      WINDOW_CLOCK_REFRESH_MS,
    );
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshClock();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [classId]);

  return {
    checklistType: resolveChecklistType(windows, now),
    hasWindow: windows.length > 0,
    isOpenNow: findOpenChecklistType(windows, now) !== null,
    loading,
    error,
  };
}
