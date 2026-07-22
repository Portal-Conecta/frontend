"use client";

import { messageFor } from "@portal/core/http/errorPresentation";
import { HttpError } from "@portal/core/http/errors";
import { Button, DefaultModal, Field, Select, Text } from "@portal/ui";
import { useEffect, useState } from "react";

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
import type {
  ChecklistItemSchema,
  ChecklistTemplateResponse,
} from "../../../types/template";

const CHECKLIST_TYPE_LABEL: Record<ChecklistType, string> = {
  ARRIVAL: "Checklist de entrada",
  POST_BREAK: "Checklist pós-intervalo",
};

function flattenItems(
  template: ChecklistTemplateResponse,
): ChecklistItemSchema[] {
  return template.schemaJson.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((section) =>
      section.items.slice().sort((a, b) => a.order - b.order),
    );
}

export interface FillChecklistPageProps {
  template: ChecklistTemplateResponse;
  roomLabel: string;
  selection: ClassSelection;
  /** Nome da turma quando a seleção é `fixed` (representante / professor com 1 turma). */
  fixedClassName?: string;

  onBack: () => void;
  onSubmitted?: (execution: ChecklistExecutionResponse) => void;
}

/**
 * Tela de preenchimento. A sala já foi escolhida; os itens do template
 * aparecem direto, independente de turma — a turma (dropdown no topo, fixa
 * pro representante) só é obrigatória de fato no envio. Enquanto não
 * escolhida, as respostas ficam só na tela; ao escolher, elas são enviadas
 * pro rascunho da turma e o autosave assume a partir daí. A janela de
 * horário só é cobrada no envio: se estiver fechada, o backend recusa e a
 * tela mostra o erro num modal.
 */
export function FillChecklistPage({
  template,
  roomLabel,
  selection,
  fixedClassName,

  onBack,
  onSubmitted,
}: FillChecklistPageProps) {
  const { classes: selectable, loading: loadingClasses } =
    useSelectableClasses(selection);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    selection.mode === "fixed" ? selection.classId : null,
  );

  const isFixed = selection.mode === "fixed";
  const classOptions = isFixed
    ? [{ value: selection.classId, label: fixedClassName ?? "" }]
    : selectable.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="flex h-full flex-col">
      <ChecklistForm
        classId={selectedClassId}
        classOptions={classOptions}
        isClassSelectionFixed={isFixed}
        isLoadingClasses={!isFixed && loadingClasses}
        onClassChange={setSelectedClassId}
        roomLabel={roomLabel}
        onBack={onBack}
        template={template}
        {...(onSubmitted ? { onSubmitted } : {})}
      />
    </div>
  );
}

interface ChecklistFormProps {
  /** `null` até o usuário escolher a turma — os itens já aparecem mesmo assim. */
  classId: string | null;
  classOptions: { value: string; label: string }[];
  isClassSelectionFixed: boolean;
  isLoadingClasses: boolean;
  onClassChange: (classId: string | null) => void;
  roomLabel: string;

  onBack: () => void;
  template: ChecklistTemplateResponse;
  onSubmitted?: (execution: ChecklistExecutionResponse) => void;
}

/** Formulário de itens + envio. Funciona sem turma escolhida (respostas só na tela). */
function ChecklistForm({
  classId,
  classOptions,
  isClassSelectionFixed,
  isLoadingClasses,
  onClassChange,
  roomLabel,

  onBack,
  template,
  onSubmitted,
}: ChecklistFormProps) {
  const {
    checklistType,
    hasWindow,
    loading: loadingType,
  } = useClassChecklistType(classId);
  const {
    execution,
    answers,
    setAnswer,
    lockedItemKeys,
    error,
    loading: isLoadingExecution,
    isSubmitting,
    submit,
  } = useFillChecklist({
    templateId: template.id,
    roomId: template.roomId,
    classId,
    checklistType,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{
    title: string;
    body: string;
  } | null>(null);

  useEffect(() => {
    if (!error) return;
    setErrorModal({ title: "Atenção", body: error });
  }, [error]);

  const items = flattenItems(template);
  const answeredCount = Object.keys(answers).length;

  const allAnswered = items.every((item) => {
    const answer = answers[item.key];
    if (!answer) return false;
    if (answer.value === "NON_COMPLIANT" && !answer.observation?.trim())
      return false;
    return true;
  });

  const isSubmitted = execution?.status === "SUBMITTED";
  const checklistLabel = checklistType
    ? CHECKLIST_TYPE_LABEL[checklistType]
    : CHECKLIST_TYPE_LABEL.ARRIVAL;
  const isSubmissionUnavailable = Boolean(
    classId && !loadingType && (!hasWindow || !checklistType),
  );

  const handleSubmit = async () => {
    if (!classId) {
      setErrorModal({
        title: "Não foi possível enviar o checklist",
        body: "Selecione uma turma antes de enviar o checklist.",
      });
      return;
    }

    const wasSubmitted = isSubmitted;
    try {
      const updated = await submit();
      if (updated) {
        onSubmitted?.(updated);
        if (!wasSubmitted && updated.status === "SUBMITTED") {
          setSuccessMessage("Checklist preenchida e enviada com sucesso");
        } else if (wasSubmitted) {
          setSuccessMessage("Alterações salvas com sucesso.");
        }
      }
    } catch (err) {
      const message =
        err instanceof HttpError
          ? (err.body?.message ?? messageFor(err.kind))
          : err instanceof Error && err.message
            ? err.message
            : "Não foi possível enviar o checklist. Tente novamente.";
      setErrorModal({
        title: "Não foi possível enviar o checklist",
        body: message,
      });
    }
  };

  const handleAnswerChange = (
    itemKey: string,
    value: ConformityAnswerValue | null,
  ) => {
    setAnswer(itemKey, value, answers[itemKey]?.observation);
  };

  const header = (
    <header className="py-4 md:py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-1">
          <Button
            variant="ghost"
            icon="chevron-left"
            aria-label="Voltar para selecionar sala"
            onClick={onBack}
            className="shrink-0"
          />

          <div className="min-w-0 flex-1">
            <Text as="h1" variant="heading-h2" tone="brand">
              {roomLabel}
            </Text>
            <Text variant="label-md-emphasis" tone="brand" className="mt-2">
              {checklistLabel}
            </Text>
          </div>
        </div>

        <div className="w-full lg:w-80 lg:shrink-0 lg:pt-1">
          <ChecklistProgressBar answered={answeredCount} total={items.length} />
        </div>
      </div>
    </header>
  );
  const classSelection = (
    <div className="max-w-xs pt-4">
      <Field label="Turma">
        <Select
          options={classOptions}
          value={classId}
          onChange={onClassChange}
          disabled={isClassSelectionFixed}
          loading={isLoadingClasses}
          placeholder="Selecione a turma"
        />
      </Field>
    </div>
  );

  const footer = (
    <div className="flex shrink-0 justify-end px-3 py-4 md:px-6 md:py-6">
      <ChecklistActions
        mode="submit"
        onSubmit={handleSubmit}
        isSubmitDisabled={
          !classId ||
          !execution ||
          isLoadingExecution ||
          !allAnswered ||
          isSubmissionUnavailable
        }
        isSubmitting={isSubmitting}
        submitLabel={isSubmitted ? "Salvar Alterações" : "Enviar Checklist"}
        className="w-full sm:w-auto"
      />
    </div>
  );

  // Turma escolhida mas sem janela de preenchimento configurada: bloqueia.
  if (isSubmissionUnavailable) {
    return (
      <>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 md:px-6 md:pb-6">
          {header}
          {classSelection}
          <div className="flex flex-1 items-center justify-center py-6">
            <ChecklistWindowClosedState
              title="Checklist não disponível"
              description="Esta turma ainda não possui uma janela de horário configurada para este checklist."
              action={
                <Button variant="outlined" onClick={onBack}>
                  Selecionar outra sala
                </Button>
              }
            />
          </div>
        </div>
        {footer}

        <DefaultModal
          isOpen={errorModal !== null}
          onClose={() => setErrorModal(null)}
          title={errorModal?.title ?? ""}
          body={errorModal?.body ?? ""}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 md:px-6 md:pb-6">
        {header}
        {classSelection}

        <div className="mt-6">
          {items.map((item) => (
            <ChecklistItem
              key={item.key}
              title={item.title}
              {...(item.description ? { description: item.description } : {})}
              value={answers[item.key]?.value ?? null}
              onChange={(value) => handleAnswerChange(item.key, value)}
              justification={answers[item.key]?.observation ?? ""}
              onJustificationChange={(text) =>
                answers[item.key]?.value &&
                setAnswer(item.key, answers[item.key]!.value, text)
              }
              disabled={isSubmitted && lockedItemKeys.has(item.key)}
            />
          ))}
        </div>
      </div>
      {footer}

      <SuccessModal
        open={successMessage !== null}
        message={successMessage ?? ""}
        onClose={() => setSuccessMessage(null)}
      />

      <DefaultModal
        isOpen={errorModal !== null}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title ?? ""}
        body={errorModal?.body ?? ""}
      />
    </>
  );
}
