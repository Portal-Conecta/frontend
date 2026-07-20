"use client";

import { useCallback, useState } from "react";
import type {
  ChecklistExecutionResponse,
  ChecklistAnswerRequest,
  ConformityAnswerValue,
} from "../types/execution";
import type { ChecklistSchema, ChecklistItemSchema, ChecklistSectionSchema } from "../types/template";
import { submitExecutionClient, cancelExecutionClient, ExecutionClientError } from "../services/client/executionClient";

export interface AnswerState {
  value: ConformityAnswerValue;
  observation?: string;
}

export interface UseChecklistExecutionOptions {
  draft: ChecklistExecutionResponse;
  schema: ChecklistSchema;
  onSuccess?: (response: ChecklistExecutionResponse) => void;
  onCancelSuccess?: () => void;
}

export function useChecklistExecution({
  draft,
  schema,
  onSuccess,
  onCancelSuccess,
}: UseChecklistExecutionOptions) {
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const setAnswer = useCallback((itemKey: string, value: ConformityAnswerValue) => {
    setAnswers((prev) => {
      const existing = prev[itemKey];
      const newState: AnswerState = { value };
      
      if (value === "NON_COMPLIANT" && existing?.observation) {
        newState.observation = existing.observation;
      }
      
      return {
        ...prev,
        [itemKey]: newState,
      };
    });
    setFormError(null);
  }, []);

  const setObservation = useCallback((itemKey: string, observation: string) => {
    setAnswers((prev) => {
      const existing = prev[itemKey];
      if (!existing) return prev;
      
      const newState: AnswerState = { value: existing.value };
      if (observation !== "") {
        newState.observation = observation;
      }
      
      return {
        ...prev,
        [itemKey]: newState,
      };
    });
    setFormError(null);
  }, []);

  const allItems: ChecklistItemSchema[] = [];
  schema.sections.forEach((s: ChecklistSectionSchema) => allItems.push(...s.items));

  const validate = useCallback((): boolean => {
    for (const item of allItems) {
      const ans = answers[item.key];
      if (item.required && !ans) {
        setFormError(`O item "${item.title}" é obrigatório.`);
        return false;
      }
      if (ans && ans.value === "NON_COMPLIANT" && (!ans.observation || ans.observation.trim() === "")) {
        setFormError(`A observação é obrigatória para o item "${item.title}" quando não conforme.`);
        return false;
      }
    }
    setFormError(null);
    return true;
  }, [answers, allItems]);

  const submit = useCallback(async () => {
    if (!validate()) return;

    setSubmitting(true);
    setFormError(null);

    const answerPayload: ChecklistAnswerRequest[] = Object.entries(answers).map(
      ([itemKey, state]) => {
        const req: ChecklistAnswerRequest = {
          itemKey,
          value: state.value,
          answeredAt: new Date().toISOString(),
        };
        const obs = state.observation?.trim();
        if (obs) {
          req.observation = obs;
        }
        return req;
      }
    );

    try {
      const response = await submitExecutionClient(draft.id, { answers: answerPayload });
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      if (err instanceof ExecutionClientError) {
        setFormError(err.message || "Falha ao enviar o checklist. Tente novamente.");
      } else {
        setFormError("Erro interno ao enviar o checklist.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [answers, draft.id, validate, onSuccess]);

  const cancel = useCallback(async () => {
    setCanceling(true);
    setFormError(null);
    try {
      await cancelExecutionClient(draft.id);
      if (onCancelSuccess) {
        onCancelSuccess();
      }
    } catch (err) {
      if (err instanceof ExecutionClientError) {
        setFormError(err.message || "Falha ao cancelar o rascunho.");
      } else {
        setFormError("Erro interno ao cancelar.");
      }
    } finally {
      setCanceling(false);
    }
  }, [draft.id, onCancelSuccess]);

  return {
    answers,
    setAnswer,
    setObservation,
    submit,
    cancel,
    submitting,
    canceling,
    formError,
  };
}
