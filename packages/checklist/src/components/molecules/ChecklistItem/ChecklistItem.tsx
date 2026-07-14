"use client";

import { Text, Textarea } from "@portal/ui";
import { useState } from "react";

import { StatusToggle } from "../../atoms/StatusToggle/StatusToggle";
import type { StatusValue } from "../../atoms/StatusToggle/StatusToggle";

export interface ChecklistItemProps {
  title: string;
  description?: string;
  value?: StatusValue | null;
  defaultValue?: StatusValue | null;
  onChange?: (value: StatusValue | null) => void;
  justification?: string;
  onJustificationChange?: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ChecklistItem({
  title,
  description,
  value,
  defaultValue,
  onChange,
  justification,
  onJustificationChange,
  disabled = false,
  className,
}: ChecklistItemProps) {
  const isControlled = value !== undefined;
  const [internalStatus, setInternalStatus] = useState<StatusValue | null>(
    defaultValue ?? null,
  );
  const selected = isControlled ? value : internalStatus;

  const isJustificationControlled = justification !== undefined;
  const [internalJustification, setInternalJustification] = useState("");
  const justificationValue = isJustificationControlled
    ? justification
    : internalJustification;

  const handleStatusChange = (next: StatusValue | null) => {
    if (!isControlled) setInternalStatus(next);
    onChange?.(next);
  };

  const handleJustificationChange = (text: string) => {
    if (!isJustificationControlled) setInternalJustification(text);
    onJustificationChange?.(text);
  };

  const showJustification = selected === "nao-conforme";

  return (
    <div
      className={["border-t border-border-default py-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Text variant="label-sm" tone="brand" className="md:text-label-md">
            {title}
          </Text>
          {description && (
            <Text variant="label-sm" tone="secondary" className="break-words">
              {description}
            </Text>
          )}
        </div>

        <StatusToggle
          {...(value !== undefined ? { value: value ?? null } : {})}
          defaultValue={defaultValue ?? null}
          onChange={handleStatusChange}
          disabled={disabled}
          className="ml-8 shrink-0"
        />
      </div>

      {/* Justificativa — sempre montada; anima entrada e saída via grid-rows
          (mesmo padrão de transition da Sidebar). Duração 500ms. */}
      <div
        aria-hidden={!showJustification}
        className={[
          "grid transition-[grid-template-rows,opacity] duration-500 ease-in-out",
          showJustification
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="mt-3">
            <Textarea
              rows={3}
              placeholder="Descreva o problema"
              aria-label="Justificativa do item não conforme"
              value={justificationValue}
              onChange={(e) => handleJustificationChange(e.target.value)}
              disabled={disabled || !showJustification}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
