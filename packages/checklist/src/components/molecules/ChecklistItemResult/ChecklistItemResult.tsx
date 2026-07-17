import { Icon, Text } from "@portal/ui";

export interface ChecklistItemResultProps {
  title: string;
  description?: string;
  status: "conforme" | "nao-conforme";
  observation?: string;
  className?: string;
}

export function ChecklistItemResult({
  title,
  description,
  status,
  observation,
  className,
}: ChecklistItemResultProps) {
  const isConforme = status === "conforme";

  return (
    <div
      className={["border-t border-border-default py-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Text variant="label-sm" tone="brand" className="md:text-label-md">
            {title}
          </Text>

          {isConforme && description && (
            <Text
              variant="label-xs"
              tone="secondary"
              className="break-words md:text-label-sm"
            >
              {description}
            </Text>
          )}
        </div>

        <div
          className={[
            "flex h-8 w-10 shrink-0 items-center justify-center gap-2 rounded-md border-sm",
            "md:h-auto md:w-30 md:px-3 md:py-2",
            isConforme
              ? "border-feedback-success text-feedback-success"
              : "border-feedback-error text-feedback-error",
          ].join(" ")}
        >
          <Icon name={isConforme ? "check-check" : "x"} size="sm" decorative />

          <Text
            variant="label-xs"
            className="whitespace-nowrap sr-only md:not-sr-only"
          >
            {isConforme ? "Conforme" : "Não Conforme"}
          </Text>
        </div>
      </div>

      {!isConforme && observation && (
        <div className="mt-3 rounded-md border-sm border-border-default bg-background-surface px-4 py-3">
          <Text variant="label-sm" tone="brand" className="break-words">
            {observation}
          </Text>
        </div>
      )}
    </div>
  );
}
