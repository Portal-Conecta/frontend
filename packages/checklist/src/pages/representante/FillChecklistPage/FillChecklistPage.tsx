"use client";

import { HttpError } from "@portal/core/http/errors";
import { Field, Select, Text, useToast } from "@portal/ui";
import { useState } from "react";

import { ChecklistActions } from "../../../components/ChecklistActions";
import { ChecklistItem } from "../../../components/ChecklistItem";
import { ChecklistProgressBar } from "../../../components/ChecklistProgressBar";
import { ChecklistWindowClosedState } from "../../../components/ChecklistWindowClosedState";
import { SuccessModal } from "../../../components/SuccessModal";
import { useClassChecklistType } from "../../../hooks/useClassChecklistType";
import { useFillChecklist } from "../../../hooks/useFillChecklist";
import { useSelectableClasses } from "../../../hooks/useSelectableClasses";
import type { ClassSelection } from "../../../services/resolveClassSelection";
import type {
  ChecklistExecutionResponse,
  ConformityAnswerValue,
} from "../../../types/execution";
import type { ChecklistType } from "../../../types/submissionWindow";
import type { ChecklistItemSchema, ChecklistTemplateResponse } from "../../../types/template";

const CHECKLIST_TYPE_LABEL: Record<ChecklistType, string> = {
  ARRIVAL: "Checklist de Entrada",
  POST_BREAK: "Checklist Pós-Intervalo",
};

function flattenItems(template: ChecklistTemplateResponse): ChecklistItemSchema[] {
  return template.schemaJson.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((section) => section.items.slice().sort((a, b) => a.order - b.order));
}

export interface FillChecklistPageProps {
  template: ChecklistTemplateResponse;
  roomLabel: string;
  selection: ClassSelection;
  /** Nome da turma quando a seleção é `fixed` (representante / professor com 1 turma). */
  fixedClassName?: string;
  filledByLabel: string;
  onSubmitted?: (execution: ChecklistExecutionResponse) => void;
}

/**
 * Tela de preenchimento. A sala já foi escolhida; aqui, no topo, escolhe-se a
 * turma (dropdown) — fixa/desabilitada pro representante, com opções pro
 * professor/admin. Ao escolher a turma, os itens abrem (o rascunho é criado ou
 * retomado a qualquer hora). A janela de horário só é cobrada no envio: se
 * estiver fechada, o backend recusa e a tela mostra o erro num modal.
 */
export function FillChecklistPage({
  template,
  roomLabel,
  selection,
  fixedClassName,
  filledByLabel,
  onSubmitted,
}: FillChecklistPageProps) {
  const { classes: selectable, loading: loadingClasses } = useSelectableClasses(selection);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    selection.mode === "fixed" ? selection.classId : null,
  );

  const isFixed = selection.mode === "fixed";
  const classOptions = isFixed
    ? [{ value: selection.classId, label: fixedClassName ?? "" }]
    : selectable.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 md:px-6 md:pt-8">
        <Text variant="heading-h2" tone="brand" className="font-inter font-bold">
          {roomLabel}
        </Text>

        <div className="mt-4 max-w-xs">
          <Field label="Turma">
            <Select
              options={classOptions}
              value={selectedClassId}
              onChange={setSelectedClassId}
              disabled={isFixed}
              loading={!isFixed && loadingClasses}
              placeholder="Selecione a turma"
            />
          </Field>
        </div>

        <Text variant="body-sm" tone="secondary" className="mt-4 font-inter">
          Preenchido por: {filledByLabel}
        </Text>
      </div>

      {selectedClassId ? (
        <ClassChecklistFill
          key={selectedClassId}
          classId={selectedClassId}
          template={template}
          {...(onSubmitted ? { onSubmitted } : {})}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center px-3">
          <Text variant="body-sm" tone="secondary" className="text-center">
            Selecione a turma para começar o preenchimento.
          </Text>
        </div>
      )}
    </div>
  );
}

interface ClassChecklistFillProps {
  classId: string;
  template: ChecklistTemplateResponse;
  onSubmitted?: (execution: ChecklistExecutionResponse) => void;
}

/** Resolve o tipo (janela configurada) da turma antes de montar o formulário. */
function ClassChecklistFill({ classId, template, onSubmitted }: ClassChecklistFillProps) {
  const { checklistType, hasWindow, loading, error } = useClassChecklistType(classId);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          Carregando...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          {error}
        </Text>
      </div>
    );
  }

  if (!hasWindow || !checklistType) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ChecklistWindowClosedState
          title="Sem janela de checklist"
          description="Esta turma não tem uma janela de preenchimento configurada."
        />
      </div>
    );
  }

  return (
    <ChecklistForm
      classId={classId}
      checklistType={checklistType}
      template={template}
      {...(onSubmitted ? { onSubmitted } : {})}
    />
  );
}

interface ChecklistFormProps {
  classId: string;
  checklistType: ChecklistType;
  template: ChecklistTemplateResponse;
  onSubmitted?: (execution: ChecklistExecutionResponse) => void;
}

/** Formulário de itens + envio, com o rascunho já criado/retomado. */
function ChecklistForm({ classId, checklistType, template, onSubmitted }: ChecklistFormProps) {
  const { execution, answers, setAnswer, lockedItemKeys, loading, isSubmitting, submit } =
    useFillChecklist({
      createParams: { templateId: template.id, roomId: template.roomId, classId, checklistType },
    });

  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const items = flattenItems(template);
  const answeredCount = Object.keys(answers).length;

  const allAnswered = items.every((item) => {
    const answer = answers[item.key];
    if (!answer) return false;
    if (answer.value === "NON_COMPLIANT" && !answer.observation?.trim()) return false;
    return true;
  });

  const isSubmitted = execution?.status === "SUBMITTED";

  const handleSubmit = async () => {
    const wasSubmitted = isSubmitted;
    try {
      const updated = await submit();
      if (updated) {
        onSubmitted?.(updated);
        if (!wasSubmitted && updated.status === "SUBMITTED") setShowSuccessModal(true);
      }
    } catch (err) {
      const message =
        err instanceof HttpError && err.body?.message
          ? err.body.message
          : "Não foi possível enviar o checklist. Tente novamente.";
      toast.error(message, { title: "Não foi possível enviar o checklist" });
    }
  };

  const handleAnswerChange = (itemKey: string, value: ConformityAnswerValue | null) => {
    if (value) setAnswer(itemKey, value, answers[itemKey]?.observation);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          Carregando...
        </Text>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-3 pb-4 md:px-6 md:pb-8">
        <div className="flex items-center justify-between gap-4">
          <Text variant="label-md-emphasis" tone="brand" className="font-inter">
            {CHECKLIST_TYPE_LABEL[checklistType]}
          </Text>
          {isSubmitted ? (
            <Text variant="label-sm-emphasis" className="text-feedback-success">
              Checklist enviado
            </Text>
          ) : (
            <Text variant="label-sm-emphasis" className="text-feedback-error">
              Checklist não realizado
            </Text>
          )}
        </div>

        <ChecklistProgressBar answered={answeredCount} total={items.length} className="mt-6" />

        <div className="mt-8">
          {items.map((item) => (
            <ChecklistItem
              key={item.key}
              title={item.title}
              {...(item.description ? { description: item.description } : {})}
              value={answers[item.key]?.value ?? null}
              onChange={(value) => handleAnswerChange(item.key, value)}
              justification={answers[item.key]?.observation ?? ""}
              onJustificationChange={(text) =>
                answers[item.key]?.value && setAnswer(item.key, answers[item.key]!.value, text)
              }
              disabled={isSubmitted && lockedItemKeys.has(item.key)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-6 py-6 md:px-10">
        <Text variant="body-sm" tone="secondary" className="hidden font-inter md:block">
          Todos os campos são de preenchimento obrigatório para envio.
        </Text>
        <ChecklistActions
          mode="submit"
          onSubmit={handleSubmit}
          isSubmitDisabled={!allAnswered}
          isSubmitting={isSubmitting}
          submitLabel={isSubmitted ? "Salvar Alterações" : "Enviar Checklist"}
        />
      </div>

      <SuccessModal
        open={showSuccessModal}
        message="Checklist preenchida e enviada com sucesso"
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
}
