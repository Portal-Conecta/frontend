import { Icon, Text } from "@portal/ui";
import type { CSSProperties } from "react";

export interface ChecklistItemResultProps {
  title: string;
  description?: string;
  status: "conforme" | "nao-conforme";
  observation?: string;
  className?: string;
}

/**
 * Chip de status — largura fixa em 136px para ambos os estados.
 */
const chipBoxStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "136px",
  minWidth: "136px",
  maxWidth: "136px",
  flex: "0 0 136px",
};

// Classes base compartilhadas (padding 12px nas laterais, 8px vertical e fonte 12px).
const statusChipBase =
  "inline-flex items-center " +
  "rounded-md border-sm px-3 py-2 " +
  "font-inter text-label-xs leading-none whitespace-nowrap overflow-hidden";

export function ChecklistItemResult({
  title,
  description,
  status,
  observation,
  className,
}: ChecklistItemResultProps) {
  const isConforme = status === "conforme";
  const statusLabel = isConforme ? "Conforme" : "Não Conforme";

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
            statusChipBase,
            isConforme
              ? "relative justify-center border-feedback-success text-feedback-success"
              : "justify-start gap-1 border-feedback-error text-feedback-error",
          ].join(" ")}
          style={chipBoxStyle}
          aria-label={statusLabel}
        >
          {isConforme ? (
            <>
              {/* CONFORME: ícone fixo à esquerda (12px) e texto no centro absoluto */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center size-4 shrink-0">
                <Icon name="check-check" size="sm" decorative className="size-4" />
              </div>
              <span className="leading-none whitespace-nowrap">
                {statusLabel}
              </span>
            </>
          ) : (
            <>
              {/* NÃO CONFORME: alinhado à esquerda com gap de 4px */}
              <Icon name="x" size="sm" decorative className="size-4 shrink-0" />
              <span className="leading-none whitespace-nowrap">
                {statusLabel}
              </span>
            </>
          )}
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
