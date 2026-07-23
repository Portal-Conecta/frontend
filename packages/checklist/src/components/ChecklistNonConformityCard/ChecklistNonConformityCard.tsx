"use client";

import { Button, Text } from "@portal/ui";
import { useId, useState } from "react";

import type { IssueStatus } from "../../types/issue";

/**
 * Colunas desktop compartilhadas entre o cabeçalho e cada linha da lista.
 * Última coluna (botão) em largura fixa (11rem, igual `ChecklistSubmissionCard`)
 * — não `auto` — pra as colunas de conteúdo alinharem entre as duas tabelas do
 * Monitor de Envios, já que os botões têm rótulos de tamanhos diferentes.
 */
export const NON_CONFORMITY_LIST_GRID_CLASS =
  "lg:grid-cols-[repeat(4,minmax(0,1fr))_11rem] lg:items-center lg:gap-x-6";

/** Cabeçalho das colunas da lista de não conformidades (desktop). */
export function ChecklistNonConformityListHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={[
        "hidden border-t border-border-default p-3 lg:grid lg:p-4",
        NON_CONFORMITY_LIST_GRID_CLASS,
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
        Item
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
      <span className="block w-[11rem]" aria-hidden />
    </div>
  );
}

export interface ChecklistNonConformityCardProps {
  room: string;
  category: string;
  submittedDate: string;
  submittedTime: string;
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
  onCancel?: () => void;
  /** Uma ação desta issue está em andamento — desabilita e mostra spinner nos botões. */
  pending?: boolean;
  className?: string;
}

export function ChecklistNonConformityCard({
  room,
  category,
  submittedDate,
  submittedTime,
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
  onCancel,
  pending = false,
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
      <div
        className={[
          "flex flex-col gap-4 p-3 lg:p-4 lg:grid",
          NON_CONFORMITY_LIST_GRID_CLASS,
        ].join(" ")}
        role="row"
      >
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
              {room}
            </Text>

            <Text variant="label-xs" className="text-interactive-hover">
              envio: {submittedDate} às {submittedTime}
            </Text>

            <Text variant="label-xs" className="text-interactive-hover">
              Turma: {group}
            </Text>
          </div>
        </div>

        <Text
          variant="label-md"
          className="hidden min-w-0 truncate text-interactive-hover lg:block lg:text-left"
        >
          {room}
        </Text>

        <Text
          variant="label-md"
          className="hidden min-w-0 truncate text-interactive-hover lg:block lg:text-left"
        >
          {category}
        </Text>

        <Text
          variant="label-md"
          className="hidden min-w-0 truncate text-interactive-hover lg:block lg:text-left"
        >
          {submittedDate} às {submittedTime}
        </Text>

        <Text
          variant="label-md"
          className="hidden min-w-0 truncate text-interactive-hover lg:block lg:text-left"
        >
          {group}
        </Text>

        <Button
          variant="outlined"
          size="sm"
          iconLeft={open ? "chevron-up" : "chevron-down"}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full shrink-0 whitespace-nowrap lg:w-auto lg:justify-self-end"
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
                    loading={pending}
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
                    loading={pending}
                  >
                    Marcar como resolvido
                  </Button>
                )}

                {(status === "OPEN" || status === "IN_PROGRESS") && (
                  <Button
                    variant="outlined"
                    tone="negative"
                    size="sm"
                    onClick={onCancel}
                    disabled={pending}
                  >
                    Cancelar
                  </Button>
                )}

                {status === "RESOLVED" && canValidate && (
                  <>
                    <Button
                      variant="outlined"
                      tone="positive"
                      size="sm"
                      onClick={onValidate}
                      loading={pending}
                    >
                      Validar
                    </Button>
                    <Button
                      variant="outlined"
                      tone="negative"
                      size="sm"
                      onClick={onReopen}
                      disabled={pending}
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
                    loading={pending}
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
