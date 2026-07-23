import { Button, Text } from "@portal/ui";

import type { ChecklistSubmission } from "../../types";

/**
 * Colunas desktop compartilhadas entre o cabeçalho e cada linha da lista.
 * Última coluna (botão) em largura fixa — não `auto` — pra alinhar com
 * `ChecklistNonConformityCard`: como os rótulos dos botões têm tamanhos
 * diferentes ("Ver Envio" vs "Ver Não Conformidade"), uma coluna `auto`
 * reservaria espaços diferentes em cada tabela e desalinharia as colunas
 * de conteúdo entre as duas seções do Monitor de Envios.
 */
export const SUBMISSION_LIST_GRID_CLASS =
  "lg:grid-cols-[repeat(4,minmax(0,1fr))_11rem] lg:items-center lg:gap-x-6";

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
        Turma
      </Text>
      {/* Reserva a coluna do botão para alinhar com as linhas */}
      <span className="block w-[11rem]" aria-hidden />
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
        SUBMISSION_LIST_GRID_CLASS,
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
