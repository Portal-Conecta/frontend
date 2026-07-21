"use client";

import { useState } from "react";

import { Button, Select, type SelectOption } from "@portal/ui";

import { ChecklistFiltersSkeleton } from "./ChecklistFiltersSkeleton";

export interface ChecklistFiltersValues {
  period?: string;
  group?: string;
  room?: string;
}

export interface ChecklistFiltersProps {
  loading?: boolean;
  periodOptions?: SelectOption[];
  groupOptions?: SelectOption[];
  roomOptions?: SelectOption[];
  onApply?: (filters: ChecklistFiltersValues) => void;
  onReset?: () => void;
  className?: string;
}

/** Período: janelas relativas fixas — sem intervalo de data customizado. */
const defaultPeriodOptions: SelectOption[] = [
  { value: "ontem", label: "Ontem" },
  { value: "3-dias", label: "Últimos 3 dias" },
  { value: "7-dias", label: "Últimos 7 dias" },
  { value: "1-mes", label: "Último mês" },
  { value: "3-meses", label: "Últimos 3 meses" },
];

export function ChecklistFilters({
  loading = false,
  periodOptions = defaultPeriodOptions,
  groupOptions = [],
  roomOptions = [],
  onApply,
  onReset,
  className,
}: ChecklistFiltersProps) {
  // Os três campos ficam vazios (`null`) por padrão — mesmo comportamento pros
  // três (placeholder cinza, texto preto só depois de escolher, "x" pra limpar).
  // Sem opção "Todos" na lista: evita ter duas formas de limpar (opção da lista
  // + botão "x") e mantém a cor do texto padronizada entre os três selects.
  const [period, setPeriod] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);

  if (loading) {
    return <ChecklistFiltersSkeleton className={className} />;
  }

  function buildFilters(): ChecklistFiltersValues {
    const filters: ChecklistFiltersValues = {};

    if (period) filters.period = period;
    if (group) filters.group = group;
    if (room) filters.room = room;

    return filters;
  }

  function handleApply() {
    onApply?.(buildFilters());
  }

  function handleReset() {
    setPeriod(null);
    setGroup(null);
    setRoom(null);
    onReset?.();
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
        {/* Select do DS força `w-full` no proprio wrapper — a largura vai na
            div externa, e o w-full do Select preenche essa div. Mobile:
            full-width empilhado; md+ (768px): cresce pra ocupar a linha (com
            teto), em vez de ficar uma caixinha pequena perdida num mar de
            espaço vazio. Breakpoint em md (não lg): com 3 selects + 2 botões
            já cabe numa linha só a partir de 768px, sem precisar de 1024px. */}
        <div className="w-full md:max-w-xs md:min-w-0 md:flex-1">
          <Select
            options={periodOptions}
            value={period}
            onChange={setPeriod}
            placeholder="Período"
            size="sm"
            aria-label="Período"
            clearable
          />
        </div>

        <div className="w-full md:max-w-xs md:min-w-0 md:flex-1">
          <Select
            options={roomOptions}
            value={room}
            onChange={setRoom}
            placeholder="Todas as salas"
            size="sm"
            aria-label="Sala"
            clearable
          />
        </div>

        <div className="w-full md:max-w-xs md:min-w-0 md:flex-1">
          <Select
            options={groupOptions}
            value={group}
            onChange={setGroup}
            placeholder="Turma"
            size="sm"
            aria-label="Turma"
            clearable
          />
        </div>

        {/* Botoes do DS sem customizacao (variant padrao) — sempre lado a lado,
            nunca empilham. No desktop, empurra pro canto direito (ml-auto)
            pra usar a largura toda: filtros na esquerda, acoes na direita. */}
        <div className="flex gap-3 md:ml-auto md:shrink-0">
          <Button
            variant="outlined"
            className="flex-1 md:flex-none"
            onClick={handleReset}
          >
            Restaurar
          </Button>
          <Button className="flex-1 md:flex-none" onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
