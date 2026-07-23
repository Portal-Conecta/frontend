import { Button, Text } from "@portal/ui";

import type { ChecklistSubmission } from "../../types";
import {
  CHECKLIST_TABLE_BUTTON_COLUMN_CLASS,
  CHECKLIST_TABLE_GRID_CLASS,
} from "../../utils/checklistTableLayout";

export interface ChecklistSubmissionCardProps extends ChecklistSubmission {
  onView?: () => void;
  className?: string;
}

/** Cabeçalho das colunas da lista de envios (desktop). */
export function ChecklistSubmissionListHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={[
        "hidden border-t border-border-default p-3 lg:grid lg:p-4",
        CHECKLIST_TABLE_GRID_CLASS,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="row"
    >
      <Text
        variant="label-md-emphasis"
        tone="brand"
        className="min-w-0 truncate text-left"
      >
        Sala
      </Text>
      <Text
        variant="label-md-emphasis"
        tone="brand"
        className="min-w-0 truncate text-left"
      >
        Tipo
      </Text>
      <Text
        variant="label-md-emphasis"
        tone="brand"
        className="min-w-0 truncate text-left"
      >
        Enviado
      </Text>
      <Text
        variant="label-md-emphasis"
        tone="brand"
        className="min-w-0 truncate text-left"
      >
        Turma
      </Text>
      {/* Reserva a coluna do botão para alinhar com as linhas */}
      <span className={`block ${CHECKLIST_TABLE_BUTTON_COLUMN_CLASS}`} aria-hidden />
    </div>
  );
}

export function ChecklistSubmissionCard({
  room,
  checklistType,
  submittedAt,
  group,
  hasNonConformity = false,
  onView,
  className,
}: ChecklistSubmissionCardProps) {
  return (
    <div
      className={[
        "border-t border-border-default p-3 lg:p-4",
        "flex flex-col gap-3 lg:grid",
        CHECKLIST_TABLE_GRID_CLASS,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="row"
    >
      {/* Mobile: título compacto */}
      <Text variant="label-sm-emphasis" tone="brand" className="lg:hidden">
        {room} - {checklistType}
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="hidden min-w-0 lg:block lg:truncate lg:text-left lg:text-label-md"
      >
        {room}
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="hidden min-w-0 lg:block lg:truncate lg:text-left lg:text-label-md"
      >
        {checklistType}
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="min-w-0 lg:truncate lg:text-left lg:text-label-md"
      >
        <span className="lg:hidden">envio: {submittedAt}</span>
        <span className="hidden lg:inline">{submittedAt}</span>
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="min-w-0 lg:truncate lg:text-left lg:text-label-md"
      >
        <span className="lg:hidden">Turma: {group}</span>
        <span className="hidden lg:inline">{group}</span>
      </Text>

      <Button
        variant="outlined"
        tone={hasNonConformity ? "negative" : "brand"}
        size="sm"
        iconLeft="eye"
        onClick={onView}
        className="mt-3 w-full shrink-0 whitespace-nowrap lg:mt-0 lg:w-auto lg:justify-self-end"
      >
        Ver Envio
      </Button>
    </div>
  );
}
