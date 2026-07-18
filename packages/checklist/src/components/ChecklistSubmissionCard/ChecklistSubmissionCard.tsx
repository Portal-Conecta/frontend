import { Button, Text } from "@portal/ui";

import type { ChecklistSubmission } from "../../types";

export interface ChecklistSubmissionCardProps extends ChecklistSubmission {
  onView?: () => void;
  className?: string;
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
        "border-b border-border-default p-3 md:p-4",
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text variant="label-sm-emphasis" tone="brand" className="md:hidden">
        {room} - {checklistType}
      </Text>

      <Text
        variant="label-xs"
        tone="brand"
        className="hidden md:block md:w-24 md:shrink-0 md:text-label-md"
      >
        {room}
      </Text>

      <Text
        variant="label-xs"
        tone="secondary"
        className="md:flex-1 md:text-center md:text-label-md"
      >
        <span className="md:hidden">envio: {submittedAt}</span>
        <span className="hidden md:inline">
          {checklistType} | enviado às {submittedAt}
        </span>
      </Text>

      <Text
        variant="label-xs"
        tone="secondary"
        className="md:flex-1 md:text-center md:text-label-md"
      >
        Preenchido por: {filledBy} | {group}
      </Text>

      <Button
        variant="outlined"
        tone={hasNonConformity ? "negative" : "brand"}
        size="sm"
        iconLeft="eye"
        onClick={onView}
        className="mt-3 w-full whitespace-nowrap md:mt-0 md:w-auto md:shrink-0"
      >
        Ver Envio
      </Button>
    </div>
  );
}
