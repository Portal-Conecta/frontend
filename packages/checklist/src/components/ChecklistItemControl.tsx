import { Text, Textarea } from "@portal/ui";
import { RadioGroup } from "@portal/ui/atoms";
import type { ChecklistItemSchema } from "../types/template";
import type { ConformityAnswerValue } from "../types/execution";
import type { AnswerState } from "../hooks/useChecklistExecution";

export interface ChecklistItemControlProps {
  item: ChecklistItemSchema;
  answer?: AnswerState | undefined;
  onAnswerChange: (value: ConformityAnswerValue) => void;
  onObservationChange: (observation: string) => void;
  hasError?: boolean;
}

const ANSWER_OPTIONS = [
  { value: "COMPLIANT", label: "Conforme" },
  { value: "NON_COMPLIANT", label: "Não Conforme" },
];

export function ChecklistItemControl({
  item,
  answer,
  onAnswerChange,
  onObservationChange,
  hasError,
}: ChecklistItemControlProps) {
  // O valor atual do RadioGroup
  const value = answer?.value ?? "";

  // Se não conforme, o campo de observação deve aparecer
  const showObservation = value === "NON_COMPLIANT";
  
  const hasObservationError = hasError && (!answer?.observation || answer.observation.trim() === "");

  return (
    <div className="flex flex-col gap-4 border-b border-border-default pb-6 last:border-b-0 last:pb-0">
      <div>
        <Text as="h3" variant="body-md-emphasis" tone="primary" className="mb-1">
          {item.title}
          {item.required && (
            <Text as="span" variant="body-md" className="ml-1 text-feedback-error">
              *
            </Text>
          )}
        </Text>
        {item.description && (
          <Text variant="body-sm" tone="secondary">
            {item.description}
          </Text>
        )}
      </div>

      <div>
        <RadioGroup
          value={value}
          onChange={(v) => onAnswerChange(v as ConformityAnswerValue)}
          options={ANSWER_OPTIONS}
          direction="horizontal"
          size="sm"
        />
      </div>

      {showObservation && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor={`obs-${item.key}`} className="sr-only">
            Observação (Obrigatória)
          </label>
          <Textarea
            id={`obs-${item.key}`}
            value={answer?.observation ?? ""}
            onChange={(e) => onObservationChange(e.target.value)}
            placeholder="Descreva o problema encontrado (Obrigatório)"
            rows={2}
            {...(hasObservationError ? { error: "A observação é obrigatória." } : {})}
          />
        </div>
      )}
    </div>
  );
}
