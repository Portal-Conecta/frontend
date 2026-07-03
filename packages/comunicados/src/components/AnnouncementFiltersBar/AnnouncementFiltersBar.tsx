"use client";

import { useState, type ChangeEvent } from "react";

import { Button, Select, Text, type SelectOption } from "@portal/ui";

export interface AnnouncementFilters {
  curso?: string;
  tipo?: string;
  turma?: string;
  turno?: string;
  periodo?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface AnnouncementFiltersBarProps {
  loading?: boolean;
  cursoOptions?: SelectOption[];
  tipoOptions?: SelectOption[];
  turmaOptions?: SelectOption[];
  turnoOptions?: SelectOption[];
  periodoOptions?: SelectOption[];
  onApply?: (filters: AnnouncementFilters) => void;
  onRestore?: () => void;
}

const todosOption: SelectOption[] = [{ value: "todos", label: "Todos" }];

function normalize(value: string | null): string | undefined {
  return value && value !== "todos" ? value : undefined;
}

export function AnnouncementFiltersBar({
  loading = false,
  cursoOptions = todosOption,
  tipoOptions = todosOption,
  turmaOptions = todosOption,
  turnoOptions = todosOption,
  periodoOptions = todosOption,
  onApply,
  onRestore,
}: AnnouncementFiltersBarProps) {
  const [curso, setCurso] = useState<string | null>("todos");
  const [tipo, setTipo] = useState<string | null>("todos");
  const [turma, setTurma] = useState<string | null>("todos");
  const [turno, setTurno] = useState<string | null>("todos");
  const [periodo, setPeriodo] = useState<string | null>("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  function buildFilters(): AnnouncementFilters {
    const filters: AnnouncementFilters = {};

    const normalizedCurso = normalize(curso);
    const normalizedTipo = normalize(tipo);
    const normalizedTurma = normalize(turma);
    const normalizedTurno = normalize(turno);
    const normalizedPeriodo = normalize(periodo);

    if (normalizedCurso) filters.curso = normalizedCurso;
    if (normalizedTipo) filters.tipo = normalizedTipo;
    if (normalizedTurma) filters.turma = normalizedTurma;
    if (normalizedTurno) filters.turno = normalizedTurno;
    if (normalizedPeriodo) filters.periodo = normalizedPeriodo;
    if (dataInicio) filters.dataInicio = dataInicio;
    if (dataFim) filters.dataFim = dataFim;

    return filters;
  }

  function handleRestore() {
    setCurso("todos");
    setTipo("todos");
    setTurma("todos");
    setTurno("todos");
    setPeriodo("todos");
    setDataInicio("");
    setDataFim("");
    onRestore?.();
  }

  return (
    <aside className="w-full max-w-lg bg-background-surface px-8 py-6">
      <Text as="h2" variant="body-xl-emphasis" tone="brand">
        Filtros
      </Text>

      <div className="mt-7 flex flex-col">
        <FilterSelect label="Curso" options={cursoOptions} value={curso} onChange={setCurso} disabled={loading}/>
        <FilterSelect label="Tipo" options={tipoOptions} value={tipo} onChange={setTipo} disabled={loading}/>
        <FilterSelect label="Turma" options={turmaOptions} value={turma} onChange={setTurma} disabled={loading}/>
        <FilterSelect label="Turno" options={turnoOptions} value={turno} onChange={setTurno} disabled={loading}/>
        <FilterSelect label="Período" options={periodoOptions} value={periodo} onChange={setPeriodo} disabled={loading}/>

        <div className="mt-4 flex w-full items-center">
          <div className="w-36">
            <DateField value={dataInicio} onChange={setDataInicio} disabled={loading} label="Data inicial"/>
          </div>

          <div className="flex flex-1 justify-center">
            <Text as="span" variant="label-xl-emphasis" tone="brand"> → </Text>
          </div>

          <div className="w-36">
            <DateField value={dataFim} onChange={setDataFim} disabled={loading} label="Data final"/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <Button variant="outlined" fullWidth className="h-9 py-0 text-label-sm" onClick={handleRestore} disabled={loading}>
            Restaurar
          </Button>

          <Button fullWidth className="h-9 py-0 text-label-sm" onClick={() => onApply?.(buildFilters())} loading={loading}>
            Aplicar
          </Button>
        </div>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string
  options: SelectOption[]
  value: string | null
  onChange: (value: string | null) => void
  disabled: boolean
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 first:mt-0">
      <Text as="span" variant="label-md-emphasis" tone="brand">
        {label}
      </Text>

      <Select options={options} value={value} onChange={onChange} placeholder="Todos" size="sm" disabled={disabled}/>
    </div>
  )
}

function DateField({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <label className="flex h-9 w-full items-center rounded-md border-sm border-border-default bg-background-surface px-3">
      <input
        type="date"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 font-inter text-label-sm text-text-secondary outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed disabled:text-text-disabled"
      />
    </label>
  );
}