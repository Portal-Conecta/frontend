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
  ChecklistAnswerResponse,
  ChecklistExecutionDraftCreateRequest,
  ChecklistExecutionResponse,
  ConformityAnswerValue,
} from "../types/execution";
import type { ChecklistType } from "../types/submissionWindow";
import type { IssueStatus } from "../types/issue";

const AUTOSAVE_DEBOUNCE_MS = 1000;
const DRAFT_DEDUPE_TTL_MS = 3000;

/** Lançada por `submit()` quando a janela fecha entre o clique e o envio. */
export const WINDOW_CLOSED_ERROR_MESSAGE = "A janela de envio foi encerrada.";

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
const draftCreationCache = new Map<
  string,
  Promise<ChecklistExecutionResponse>
>();

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
  isWindowOpen: boolean;
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

/** Converte as respostas salvas de uma execução para o formato usado pelo estado local do form. */
export function answerStateFromResponses(
  answers: ChecklistAnswerResponse[],
): Record<string, ChecklistAnswerState> {
  return Object.fromEntries(
    answers.map((answer) => [
      answer.itemKey,
      {
        value: answer.value,
        ...(answer.observation ? { observation: answer.observation } : {}),
      },
    ]),
  );
}

/**
 * Funde respostas dadas localmente (ex.: antes de escolher a turma) com as
 * já salvas na execução retomada — local tem prioridade por item, o resto
 * das respostas já salvas é preservado em vez de descartado.
 *
 * Extraída como função pura (sem depender do hook) pra ser testável direto:
 * é a reconciliação que causava tanto perda silenciosa de respostas num
 * rascunho quanto o erro "Item obrigatorio sem resposta" ao editar um
 * checklist já enviado, quando o usuário respondia algo antes de escolher a
 * turma.
 */
export function mergeAnswersWithExisting(
  existing: Record<string, ChecklistAnswerState>,
  local: Record<string, ChecklistAnswerState>,
): Record<string, ChecklistAnswerState> {
  return { ...existing, ...local };
}

/**
 * `itemKey -> status` das issues que ainda travam o item no preenchimento —
 * dá pra renderizar a Tag certa (Em Análise/Em Manutenção) sem perder o
 * status. RESOLVED sai daqui junto com VALIDATED/CANCELED: assim que o
 * supervisor marca como resolvido, a Tag "Em Manutenção" some e o item volta
 * a ficar editável pro representante reavaliar.
 */
function lockedItemStatusesFrom(
  execution: ChecklistExecutionResponse | null,
): Map<string, IssueStatus> {
  const statuses = new Map<string, IssueStatus>();
  if (!execution) return statuses;
  for (const issue of execution.issues) {
    if (
      issue.status === "OPEN" ||
      issue.status === "IN_PROGRESS" ||
      issue.status === "REOPENED"
    ) {
      statuses.set(issue.itemKey, issue.status);
    }
  }
  return statuses;
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
  isWindowOpen,
}: UseFillChecklistOptions) {
  const [execution, setExecution] = useState<ChecklistExecutionResponse | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswerState>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answersRef = useRef(answers);
  const executionRef = useRef(execution);
  const errorRef = useRef(error);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveInFlightRef = useRef<Promise<void> | null>(null);
  const resolvedSlotRef = useRef<string | null>(null);
  const loadRequestRef = useRef(0);
  const isWindowOpenRef = useRef(isWindowOpen);
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
    isWindowOpenRef.current = isWindowOpen;
  }, [isWindowOpen]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const clearPendingAutosave = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };

    if (!classId || !checklistType) {
      loadRequestRef.current += 1;
      resolvedSlotRef.current = null;
      clearPendingAutosave();
      if (executionRef.current) setAnswers({});
      setExecution(null);
      return;
    }

    if (!isWindowOpen) {
      loadRequestRef.current += 1;
      resolvedSlotRef.current = null;
      clearPendingAutosave();
      setExecution(null);
      setAnswers({});
      setLoading(false);
      setIsSaving(false);
      return;
    }

    const slotKey = `${classId}|${roomId}|${checklistType}|${templateId}`;
    if (resolvedSlotRef.current === slotKey) return;

    const isFirstResolution = resolvedSlotRef.current === null;
    const localAnswersSnapshot = answersRef.current;
    resolvedSlotRef.current = slotKey;
    const requestId = ++loadRequestRef.current;

    if (!isFirstResolution) {
      setExecution(null);
      setAnswers({});
    }

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
        if (!mountedRef.current || loadRequestRef.current !== requestId) return;

        const loadFromServer = () => {
          setExecution(data);
          setAnswers(answerStateFromResponses(data.answersJson.answers));
        };

        if (isFirstResolution && Object.keys(localAnswersSnapshot).length > 0) {
          // Usuário já tinha respondido algo antes de escolher a turma — funde
          // com o que a execução retomada já tinha salvo (local tem prioridade
          // por item) em vez de sobrescrever o resto das respostas já salvas.
          // Se a execução retomada já foi enviada, `/draft` rejeita (só vale
          // pra status DRAFT) — nesse caso usa `/answers` mesmo.
          const existingAnswers = answerStateFromResponses(
            data.answersJson.answers,
          );
          const mergedAnswers = mergeAnswersWithExisting(
            existingAnswers,
            localAnswersSnapshot,
          );
          const answerBody = {
            answers: toAnswerRequestList(mergedAnswers),
          };
          try {
            const updated =
              data.status === "SUBMITTED"
                ? await updateExecutionAnswersClient(data.id, answerBody)
                : await saveDraftAnswersClient(data.id, answerBody);
            if (!mountedRef.current || loadRequestRef.current !== requestId)
              return;
            setExecution(updated);
            setAnswers(mergedAnswers);
          } catch (err) {
            // Alguma resposta dada antes de escolher a turma conflita com o
            // estado real da execução retomada (ex.: item travado por
            // pendência aberta) — carrega o que já está salvo em vez de
            // deixar a tela sem execução resolvida, e avisa o motivo.
            if (!mountedRef.current || loadRequestRef.current !== requestId)
              return;
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
        if (mountedRef.current && loadRequestRef.current === requestId)
          setError("Não foi possível carregar o checklist. Tente novamente.");
      } finally {
        if (mountedRef.current && loadRequestRef.current === requestId)
          setLoading(false);
      }
    }

    void load();
  }, [classId, checklistType, isWindowOpen, templateId, roomId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const scheduleAutosave = useCallback(() => {
    const current = executionRef.current;
    if (!isWindowOpenRef.current || !current || current.status !== "DRAFT")
      return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsSaving(true);
      const request = saveDraftAnswersClient(current.id, {
        answers: toAnswerRequestList(answersRef.current),
      })
        .then((updated) => setExecution(updated))
        .catch(() => {
          // autosave falha silenciosamente — a próxima edição tenta salvar de novo.
        })
        .finally(() => {
          setIsSaving(false);
          if (autosaveInFlightRef.current === request) {
            autosaveInFlightRef.current = null;
          }
        });
      autosaveInFlightRef.current = request;
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  const setAnswer = useCallback(
    (
      itemKey: string,
      value: ConformityAnswerValue | null,
      observation?: string,
    ) => {
      if (classId && checklistType && !isWindowOpenRef.current) return;

      setAnswers((prev) => {
        if (!value) {
          const next = { ...prev };
          delete next[itemKey];
          return next;
        }

        return {
          ...prev,
          [itemKey]: { value, ...(observation ? { observation } : {}) },
        };
      });
      scheduleAutosave();
    },
    [classId, checklistType, scheduleAutosave],
  );

  const submit = useCallback(async () => {
    if (!isWindowOpenRef.current) {
      throw new Error(WINDOW_CLOSED_ERROR_MESSAGE);
    }

    const current = executionRef.current;
    if (!current) {
      throw new Error(
        errorRef.current ||
          "Não foi possível preparar o checklist para envio. Tente novamente.",
      );
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    // O timer pode já ter disparado (PATCH de autosave em voo) mesmo com o
    // clearTimeout acima — esperar ele terminar evita que as duas escritas
    // corram em paralelo e o submit perca a checagem de versão otimista
    // (409 "registro alterado por outro usuário", sendo o autosave o outro).
    if (autosaveInFlightRef.current) await autosaveInFlightRef.current;
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
    lockedItemStatuses: lockedItemStatusesFrom(execution),
    loading,
    error,
    isSaving,
    isSubmitting,
    submit,
  };
}
