import { Button, Text } from "@portal/ui";

import type { ChecklistSubmission } from "../../types";

/** Colunas desktop compartilhadas entre o cabeçalho e cada linha da lista. */
export const SUBMISSION_LIST_GRID_CLASS =
  "md:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-center md:gap-x-6";

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
        "hidden border-t border-border-default p-3 md:grid md:p-4",
        SUBMISSION_LIST_GRID_CLASS,
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
        Preenchido por
      </Text>
      {/* Reserva a coluna do botão para alinhar com as linhas */}
      <span className="block w-[7.5rem]" aria-hidden />
    </div>
  );
}

export function ChecklistSubmissionCard({
  room,
  checklistType,
  submittedAt,
  filledBy,
  group,
  hasNonConformity = false,
  onView,
  className,
}: ChecklistSubmissionCardProps) {
  return (
    <div
      className={[
        "border-t border-border-default p-3 md:p-4",
        "flex flex-col gap-3 md:grid",
        SUBMISSION_LIST_GRID_CLASS,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="row"
    >
      {/* Mobile: título compacto */}
      <Text variant="label-sm-emphasis" tone="brand" className="md:hidden">
        {room} - {checklistType}
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="hidden min-w-0 md:block md:truncate md:text-left md:text-label-md"
      >
        {room}
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="hidden min-w-0 md:block md:truncate md:text-left md:text-label-md"
      >
        {checklistType}
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="min-w-0 md:truncate md:text-left md:text-label-md"
      >
        <span className="md:hidden">envio: {submittedAt}</span>
        <span className="hidden md:inline">{submittedAt}</span>
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="min-w-0 md:truncate md:text-left md:text-label-md"
      >
        <span className="md:hidden">
          Preenchido por: {filledBy} | {group}
        </span>
        <span className="hidden md:inline">
          {filledBy} | {group}
        </span>
      </Text>

      <Button
        variant="outlined"
        tone={hasNonConformity ? "negative" : "brand"}
        size="sm"
        iconLeft="eye"
        onClick={onView}
        className="mt-3 w-full shrink-0 whitespace-nowrap md:mt-0 md:w-auto md:justify-self-end"
      >
        Ver Envio
      </Button>
    </div>
  );
}
