"use client";

import { useMemo } from "react";
import { Button, Text } from "@portal/ui";
import { Alert } from "@portal/ui/molecules";
import type { ChecklistExecutionResponse } from "../types/execution";
import type { ChecklistSchema } from "../types/template";
import { useChecklistExecution } from "../hooks/useChecklistExecution";
import { ChecklistItemControl } from "./ChecklistItemControl";

export interface ChecklistFormProps {
  draft: ChecklistExecutionResponse;
  schema: ChecklistSchema;
  onSuccess: (response: ChecklistExecutionResponse) => void;
  onCancelSuccess: () => void;
}

export function ChecklistForm({
  draft,
  schema,
  onSuccess,
  onCancelSuccess,
}: ChecklistFormProps) {
  const {
    answers,
    setAnswer,
    setObservation,
    submit,
    cancel,
    submitting,
    canceling,
    formError,
  } = useChecklistExecution({
    draft,
    schema,
    onSuccess,
    onCancelSuccess,
  });

  const sortedSections = useMemo(() => {
    return [...schema.sections].sort((a, b) => a.order - b.order);
  }, [schema.sections]);

  const hasGlobalError = formError !== null;

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
      {sortedSections.map((section) => {
        const sortedItems = [...section.items].sort((a, b) => a.order - b.order);

        return (
          <section
            key={section.key}
            className="bg-background-surface rounded-lg border border-border-default p-6 shadow-sm flex flex-col gap-6"
          >
            <div className="border-b border-border-default pb-4">
              <Text as="h2" variant="heading-h2" tone="primary">
                {section.title}
              </Text>
            </div>
            
            <div className="flex flex-col gap-6">
              {sortedItems.map((item) => {
                const answerState = answers[item.key];
                return (
                  <ChecklistItemControl
                    key={item.key}
                    item={item}
                    answer={answerState}
                    onAnswerChange={(val) => setAnswer(item.key, val)}
                    onObservationChange={(obs) => setObservation(item.key, obs)}
                    hasError={hasGlobalError}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {hasGlobalError && (
        <Alert>
          <Text variant="label-md-emphasis">{formError}</Text>
        </Alert>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-4 items-center justify-end mt-4">
        <Button
          variant="outlined"
          disabled={submitting || canceling}
          onClick={cancel}
          loading={canceling}
        >
          Cancelar rascunho
        </Button>
        <Button
          variant="solid"
          tone="brand"
          disabled={submitting || canceling}
          onClick={submit}
          loading={submitting}
        >
          Enviar Avaliação
        </Button>
      </div>
    </div>
  );
}
