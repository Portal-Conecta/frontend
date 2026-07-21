"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HttpError } from "@portal/core/http/errors";

import {
  createDraftClient,
  findActiveExecutionClient,
  saveDraftAnswersClient,
  submitExecutionClient,
  updateExecutionAnswersClient,
} from "../services/client/executionClient";
import type {
  ChecklistAnswerRequest,
  ChecklistExecutionDraftCreateRequest,
  ChecklistExecutionResponse,
  ConformityAnswerValue,
} from "../types/execution";
import type { ChecklistType } from "../types/submissionWindow";

const AUTOSAVE_DEBOUNCE_MS = 1000;
const DRAFT_DEDUPE_TTL_MS = 3000;

/**
 * Retoma a execução ativa do slot (turma+sala+tipo) ou cria um rascunho novo.
 * Retomar é o que faz o autosave valer a pena: sair e voltar carrega o que já
 * foi preenchido, em vez de falhar por duplicidade. Se a criação colidir (já
 * existe execução hoje), busca e retoma a existente.
 */
async function resumeOrCreateDraft(
  params: ChecklistExecutionDraftCreateRequest,
): Promise<ChecklistExecutionResponse> {
  const existing = await findActiveExecutionClient(
    params.classId,
    params.roomId,
    params.checklistType,
  );
  if (existing) return existing;

  try {
    return await createDraftClient(params);
  } catch (err) {
    const afterRace = await findActiveExecutionClient(
      params.classId,
      params.roomId,
      params.checklistType,
    );
    if (afterRace) return afterRace;
    throw err;
  }
}

/**
 * Dedupe por (turma, sala, tipo, template). Em dev, StrictMode/Fast Refresh
 * remontam a tela e disparam o efeito várias vezes; montagens simultâneas
 * compartilham a mesma promessa, e o resultado fica em cache por um instante
 * curto pra cobrir a rajada — evitando buscas/POSTs repetidos.
 */
const draftCreationCache = new Map<string, Promise<ChecklistExecutionResponse>>();

function draftKey(params: ChecklistExecutionDraftCreateRequest): string {
  return `${params.classId}|${params.roomId}|${params.checklistType}|${params.templateId}`;
}

function getOrCreateDraft(
  params: ChecklistExecutionDraftCreateRequest,
): Promise<ChecklistExecutionResponse> {
  const key = draftKey(params);
  const cached = draftCreationCache.get(key);
  if (cached) return cached;

  const promise = resumeOrCreateDraft(params);
  draftCreationCache.set(key, promise);
  promise.then(
    () => setTimeout(() => draftCreationCache.delete(key), DRAFT_DEDUPE_TTL_MS),
    () => draftCreationCache.delete(key),
  );
  return promise;
}

export interface ChecklistAnswerState {
  value: ConformityAnswerValue;
  observation?: string;
}

export interface UseFillChecklistOptions {
  templateId: string;
  roomId: string;
  /** `null` enquanto a turma ainda não foi escolhida — as respostas ficam só na tela, sem salvar. */
  classId: string | null;
  /** `null` até a turma ser resolvida (depende da turma ter janela configurada). */
  checklistType: ChecklistType | null;
}

function toAnswerRequestList(
  answers: Record<string, ChecklistAnswerState>,
): ChecklistAnswerRequest[] {
  return Object.entries(answers).map(([itemKey, answer]) => ({
    itemKey,
    value: answer.value,
    ...(answer.observation ? { observation: answer.observation } : {}),
  }));
}

function lockedItemKeysFrom(execution: ChecklistExecutionResponse | null): Set<string> {
  if (!execution) return new Set();
  return new Set(
    execution.issues
      .filter((issue) => issue.status !== "VALIDATED" && issue.status !== "CANCELED")
      .map((issue) => issue.itemKey),
  );
}

/**
 * Carrega (ou cria) uma execução de checklist e gerencia o preenchimento
 * incremental: cada `setAnswer` salva automaticamente em segundo plano
 * (debounce de 1s) via `PATCH /draft`, sem precisar de botão de rascunho.
 *
 * `classId`/`checklistType` podem chegar nulos (turma ainda não escolhida):
 * o preenchimento funciona só na tela (sem `execution`, sem autosave) até a
 * turma ser escolhida. Quando ela chega, cria/retoma o rascunho e — se o
 * usuário já tinha respondido algo antes de escolher — envia essas respostas
 * pro rascunho recém-obtido; senão, carrega o que já estava salvo nele.
 */
export function useFillChecklist({
  templateId,
  roomId,
  classId,
  checklistType,
}: UseFillChecklistOptions) {
  const [execution, setExecution] = useState<ChecklistExecutionResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswerState>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answersRef = useRef(answers);
  const executionRef = useRef(execution);
  const errorRef = useRef(error);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedClassIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    executionRef.current = execution;
  }, [execution]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!classId || !checklistType) return;
    if (resolvedClassIdRef.current === classId) return;

    const isFirstResolution = resolvedClassIdRef.current === null;
    const localAnswersSnapshot = answersRef.current;
    resolvedClassIdRef.current = classId;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getOrCreateDraft({
          templateId,
          roomId,
          classId: classId!,
          checklistType: checklistType!,
        });
        if (!mountedRef.current) return;

        const loadFromServer = () => {
          setExecution(data);
          setAnswers(
            Object.fromEntries(
              data.answersJson.answers.map((answer) => [
                answer.itemKey,
                { value: answer.value, ...(answer.observation ? { observation: answer.observation } : {}) },
              ]),
            ),
          );
        };

        if (isFirstResolution && Object.keys(localAnswersSnapshot).length > 0) {
          // Usuário já tinha respondido algo antes de escolher a turma —
          // manda pro rascunho/execução recém-obtido em vez de sobrescrever com
          // o dele. Se a execução retomada já foi enviada, `/draft` rejeita
          // (só vale pra status DRAFT) — nesse caso usa `/answers` mesmo.
          const answerBody = { answers: toAnswerRequestList(localAnswersSnapshot) };
          try {
            const updated =
              data.status === "SUBMITTED"
                ? await updateExecutionAnswersClient(data.id, answerBody)
                : await saveDraftAnswersClient(data.id, answerBody);
            if (!mountedRef.current) return;
            setExecution(updated);
          } catch (err) {
            // Alguma resposta dada antes de escolher a turma conflita com o
            // estado real da execução retomada (ex.: item travado por
            // pendência aberta) — carrega o que já está salvo em vez de
            // deixar a tela sem execução resolvida, e avisa o motivo.
            if (!mountedRef.current) return;
            loadFromServer();
            setError(
              err instanceof HttpError && err.body?.message
                ? err.body.message
                : "Uma ou mais respostas não puderam ser aplicadas à turma selecionada.",
            );
          }
        } else {
          loadFromServer();
        }
      } catch {
        if (mountedRef.current) setError("Não foi possível carregar o checklist. Tente novamente.");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    void load();
  }, [classId, checklistType, templateId, roomId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const scheduleAutosave = useCallback(() => {
    const current = executionRef.current;
    if (!current || current.status !== "DRAFT") return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsSaving(true);
      saveDraftAnswersClient(current.id, { answers: toAnswerRequestList(answersRef.current) })
        .then((updated) => setExecution(updated))
        .catch(() => {
          // autosave falha silenciosamente — a próxima edição tenta salvar de novo.
        })
        .finally(() => setIsSaving(false));
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  const setAnswer = useCallback(
    (itemKey: string, value: ConformityAnswerValue, observation?: string) => {
      setAnswers((prev) => ({
        ...prev,
        [itemKey]: { value, ...(observation ? { observation } : {}) },
      }));
      scheduleAutosave();
    },
    [scheduleAutosave],
  );

  const submit = useCallback(async () => {
    const current = executionRef.current;
    if (!current) {
      throw new Error(
        errorRef.current || "Não foi possível preparar o checklist para envio. Tente novamente.",
      );
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsSubmitting(true);
    try {
      const body = { answers: toAnswerRequestList(answersRef.current) };
      const updated =
        current.status === "SUBMITTED"
          ? await updateExecutionAnswersClient(current.id, body)
          : await submitExecutionClient(current.id, body);
      setExecution(updated);
      return updated;
    } finally {
      // Deixa o erro (ex.: janela fechada) propagar pra tela mostrar no modal.
      setIsSubmitting(false);
    }
  }, []);

  return {
    execution,
    answers,
    setAnswer,
    lockedItemKeys: lockedItemKeysFrom(execution),
    loading,
    error,
    isSaving,
    isSubmitting,
    submit,
  };
}
