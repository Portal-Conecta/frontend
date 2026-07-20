"use client";

import { Button, Text } from "@portal/ui";
import { useId, useState } from "react";

import type { IssueStatus } from "../../types/issue";

export interface ChecklistNonConformityCardProps {
  room: string;
  category: string;
  checklistType: string;
  submittedDate: string;
  submittedTime: string;
  filledBy: string;
  group: string;
  nonConformity: string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  /** Status atual da pendência — define quais ações aparecem no painel expandido. */
  status?: IssueStatus;
  /** Validar/reabrir só existem para o coordenador SENAI (backend retorna 403 pros demais). */
  canValidate?: boolean;
  onStart?: () => void;
  onResolve?: () => void;
  onValidate?: () => void;
  onReopen?: () => void;
  onRestartProgress?: () => void;
  className?: string;
}

export function ChecklistNonConformityCard({
  room,
  category,
  checklistType,
  submittedDate,
  submittedTime,
  filledBy,
  group,
  nonConformity,
  defaultOpen = false,
  onToggle,
  status,
  canValidate = false,
  onStart,
  onResolve,
  onValidate,
  onReopen,
  onRestartProgress,
  className,
}: ChecklistNonConformityCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  };

  return (
    <div
      className={["border-t border-border-default", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 p-3 md:p-4 lg:grid lg:grid-cols-5 lg:items-center lg:gap-4">
        {/* Mobile: dados agrupados */}
        <div className="flex flex-col lg:hidden">
          <Text
            variant="label-sm-emphasis"
            className="mb-4 text-interactive-hover"
          >
            {category}
          </Text>

          <div className="flex flex-col gap-1">
            <Text
              variant="label-sm-emphasis"
              className="text-interactive-hover"
            >
              {room} - {checklistType}
            </Text>

            <Text variant="label-xs" className="text-interactive-hover">
              envio: {submittedDate} às {submittedTime}
            </Text>

            <Text variant="label-xs" className="text-interactive-hover">
              Preenchido por: {filledBy} | {group}
            </Text>
          </div>
        </div>

        {/* Desktop: grid com 5 colunas de largura igual — o template é o mesmo em
            toda linha repetida pelo .map(), então as colunas alinham entre as
            linhas independente do tamanho do conteúdo de cada uma. */}
        <Text
          variant="label-md"
          className="hidden text-interactive-hover lg:block lg:truncate lg:text-left"
        >
          {room}
        </Text>

        <Text
          variant="label-md"
          className="hidden text-interactive-hover lg:block lg:truncate lg:text-left"
        >
          {category}
        </Text>

        <Text
          variant="label-md"
          className="hidden text-interactive-hover lg:block lg:text-left"
        >
          {checklistType} | enviado às {submittedTime}
        </Text>

        <Text
          variant="label-md"
          className="hidden text-interactive-hover lg:block lg:text-left"
        >
          Preenchido por: {filledBy} | {group}
        </Text>

        <Button
          variant="outlined"
          size="sm"
          iconLeft={open ? "chevron-up" : "chevron-down"}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full whitespace-nowrap lg:w-auto lg:justify-self-end"
        >
          Ver Não Conformidade
        </Button>
      </div>

      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4">
            <div
              id={panelId}
              role="region"
              aria-label={`Não conformidade — ${room}`}
              className="rounded-md border-sm border-border-default bg-background-default p-3"
            >
              <Text variant="label-sm" className="text-interactive-hover">
                {nonConformity}
              </Text>
            </div>

            {/* Ações seguem o fluxo de status da issue: OPEN → IN_PROGRESS →
                RESOLVED → VALIDATED, com REOPENED voltando pra IN_PROGRESS via
                endpoint próprio (restart-progress). Validar/reabrir são
                exclusivos do coordenador SENAI — o backend rejeita os demais. */}
            {(status === "OPEN" ||
              status === "IN_PROGRESS" ||
              status === "REOPENED" ||
              (status === "RESOLVED" && canValidate)) && (
              <div className="mt-3 flex flex-wrap gap-3">
                {status === "OPEN" && (
                  <Button
                    variant="outlined"
                    tone="brand"
                    size="sm"
                    onClick={onStart}
                  >
                    Iniciar atendimento
                  </Button>
                )}

                {status === "IN_PROGRESS" && (
                  <Button
                    variant="outlined"
                    tone="positive"
                    size="sm"
                    onClick={onResolve}
                  >
                    Marcar como resolvido
                  </Button>
                )}

                {status === "RESOLVED" && canValidate && (
                  <>
                    <Button
                      variant="outlined"
                      tone="positive"
                      size="sm"
                      onClick={onValidate}
                    >
                      Validar
                    </Button>
                    <Button
                      variant="outlined"
                      tone="negative"
                      size="sm"
                      onClick={onReopen}
                    >
                      Reabrir
                    </Button>
                  </>
                )}

                {status === "REOPENED" && (
                  <Button
                    variant="outlined"
                    tone="brand"
                    size="sm"
                    onClick={onRestartProgress}
                  >
                    Reiniciar atendimento
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
