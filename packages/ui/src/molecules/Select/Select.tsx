"use client";

/**
 * Select — combobox EDITÁVEL com dropdown próprio (input + lista).
 *
 * Este arquivo é o **controle**: um `<input>` com a caixa visual do átomo
 * `Input` onde o usuário digita para **filtrar** as opções. A mecânica de
 * combobox (aberto/fechado, teclado APG, click-outside, `aria-activedescendant`,
 * scroll do ativo) vem do hook compartilhado `useCombobox`; aqui ficam apenas as
 * partes específicas do Select: filtro pelo texto, rótulo selecionado, revert do
 * texto ao fechar e `clearable`. O painel de opções é o irmão `SelectList`
 * (presentacional), reusado pelo SelectAsync.
 *
 * O texto digitado é **apenas filtro**: o `onChange` devolve o `value` de uma
 * opção válida (`string | null`) — não há entrada de texto livre. Ao fechar sem
 * escolher (Esc/Tab/click-outside), o campo volta a mostrar o item selecionado.
 *
 * Sem label visível (placeholder-only, como o `Input`): use `aria-label` ou um
 * Field. A borda focada usa `border-border-focus` (#01258f) — token do input
 * focado no Figma.
 */
import { useEffect, useState, type ChangeEvent } from "react";

import { Icon } from "../../atoms/Icon";
import { useCombobox } from "../../hooks/useCombobox";
import { SelectList } from "./SelectList";
import { sizeStyles, type SelectOption, type SelectSize } from "./types";

export type { SelectOption, SelectSize } from "./types";

export interface SelectProps {
  options: SelectOption[];
  /** Valor selecionado (controlado). `null`/`undefined` = nada selecionado. */
  value?: string | null;
  /** Obrigatório: o Select é controlado (como o `Checkbox`), sem onChange ele ficaria travado. */
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Mensagem de erro de validação. Presença ativa o estado de erro (barra + mensagem). */
  error?: string;
  /** Mostra um `x` à direita (antes do chevron) para limpar a seleção. */
  clearable?: boolean;
  size?: SelectSize;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Só para layout externo. */
  className?: string;
  // --- estado assíncrono (preenchido pelo SelectAsync) ---
  loading?: boolean | undefined;
  /** Texto do estado "sem opções" (filtro sem match, lista vazia ou falha de carregamento). */
  emptyMessage?: string | undefined;
  /** Avisa abertura/fechamento (o SelectAsync usa para carregar ao abrir). */
  onOpenChange?: (open: boolean) => void;
}

/** Primeiro índice habilitado de uma lista de opções. */
function firstEnabledIndex(options: SelectOption[]): number {
  return options.findIndex((o) => !o.disabled);
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  disabled = false,
  error,
  clearable = false,
  size = "md",
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
  loading,
  emptyMessage,
  onOpenChange,
}: SelectProps) {
  // Texto do input. `typed` indica se o usuário editou desde a última abertura:
  // ao abrir sem digitar, mostramos todas as opções; só filtramos depois de digitar.
  const [query, setQuery] = useState("");
  const [typed, setTyped] = useState(false);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selectedOption =
    selectedIndex === -1 ? undefined : options[selectedIndex];
  const selectedLabel = selectedOption?.label ?? "";

  function filterOptions(q: string): SelectOption[] {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((o) => o.label.toLowerCase().includes(needle));
  }
  const filtered = typed ? filterOptions(query) : options;

  const {
    open,
    entered,
    activeIndex,
    setActiveIndex,
    containerRef,
    inputRef,
    listRef,
    baseId,
    listId,
    optionId,
    openMenu,
    closeMenu,
    comboboxAriaProps,
  } = useCombobox({
    itemCount: filtered.length,
    isItemDisabled: (i) => !!filtered[i]?.disabled,
    disabled,
    onSelect: selectOption,
    onOpenChange,
    getDefaultActiveIndex: () =>
      selectedIndex === -1 ? firstEnabledIndex(options) : selectedIndex,
    id,
  });

  const errorId = `${baseId}-error`;

  function selectOption(index: number) {
    const option = filtered[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    // Acerta o texto na hora (sem flash); o efeito abaixo é a rede de segurança.
    setQuery(option.label);
    setTyped(false);
    closeMenu();
  }

  // Rede de segurança: mantém o texto em sincronia com a seleção quando fechado.
  // Cobre o mount, o revert de Esc/Tab/click-outside e mudanças externas/assíncronas
  // (ex.: o label do SelectAsync, que resolve após carregar).
  useEffect(() => {
    if (!open) {
      setQuery(selectedLabel);
      setTyped(false);
    }
  }, [open, selectedLabel]);

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setQuery(next);
    setTyped(true);
    if (!open) openMenu();
    setActiveIndex(firstEnabledIndex(filterOptions(next)));
  }

  const boxClasses = [
    "flex w-full items-center gap-2 rounded-md border-sm transition-colors font-inter",
    "focus-within:ring-2 focus-within:ring-border-focus",
    sizeStyles[size].trigger,
    disabled
      ? "bg-background-default border-border-disabled"
      : "bg-background-surface " +
        // Erro não pinta a borda da caixa (espelha o átomo Input): só a barra + mensagem abaixo.
        (open ? "border-border-focus" : "border-border-default"),
  ].join(" ");

  const inputClasses = [
    "min-w-0 flex-1 border-0 bg-transparent p-0 outline-none appearance-none",
    disabled
      ? "cursor-not-allowed text-text-disabled placeholder:text-text-disabled"
      : "text-text-primary placeholder:text-text-placeholder",
  ].join(" ");

  // `x` de limpar só aparece com valor selecionado e habilitado.
  const showClear = clearable && !!selectedOption && !disabled;

  return (
    <div
      ref={containerRef}
      className={className ? `relative w-full ${className}` : "relative w-full"}
    >
      <div className={boxClasses}>
        <input
          {...comboboxAriaProps}
          ref={inputRef}
          id={baseId}
          type="text"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          disabled={disabled}
          value={query}
          onChange={onInputChange}
          onFocus={() => inputRef.current?.select()}
          onClick={() => openMenu()}
          className={inputClasses}
        />

        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Limpar seleção"
            onClick={() => {
              onChange(null);
              setQuery("");
              setTyped(false);
              inputRef.current?.focus();
            }}
            className="shrink-0 cursor-pointer rounded text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Icon name="x" size={sizeStyles[size].icon} decorative />
          </button>
        ) : null}

        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Ocultar opções" : "Mostrar opções"}
          disabled={disabled}
          onClick={() => {
            if (open) closeMenu();
            else {
              inputRef.current?.focus();
              openMenu();
            }
          }}
          className={`shrink-0 ${disabled ? "cursor-not-allowed text-text-disabled" : "cursor-pointer text-text-secondary"}`}
        >
          <Icon
            name="chevron-down"
            size={sizeStyles[size].icon}
            decorative
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open ? (
        <SelectList
          ref={listRef}
          options={filtered}
          value={value}
          activeIndex={activeIndex}
          size={size}
          listId={listId}
          optionId={optionId}
          entered={entered}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          onSelect={selectOption}
          onActivate={setActiveIndex}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      ) : null}

      {/* Estado de erro de validação espelha o do átomo Input (mesma barra + role=alert). */}
      {error ? (
        <div id={errorId} role="alert" className="mt-2 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error"
          />
          <span className="text-label-xs font-inter text-feedback-error">
            {error}
          </span>
        </div>
      ) : null}
    </div>
  );
}
