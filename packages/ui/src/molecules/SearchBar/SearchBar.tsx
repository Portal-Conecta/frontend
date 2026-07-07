"use client";

/**
 * SearchBar — campo de busca com lista rolável de resultados ricos.
 *
 * Inicia **vazio**; ao digitar, os resultados (`items`) aparecem abaixo numa
 * lista separada por régua (`SearchBarResults`). A mecânica de combobox (teclado
 * APG, click-outside, `aria-activedescendant`, scroll do ativo) vem do hook
 * compartilhado `useCombobox` — o mesmo do `Select`, sem reinventar a navegação.
 *
 * Base **controlada**: recebe `items` (já buscados) + `loading` e emite
 * `onQueryChange`. O ciclo assíncrono (debounce/fetch) fica no `SearchBarAsync`.
 *
 * Dois modos, via `onSelect` (sempre dispara) + `clearOnSelect`:
 * - `true` (default): limpa o campo após escolher — caso de ação/navegação.
 * - `false`: preenche o campo com o `label` do item — espelha o `Select`.
 *
 * Seleção persistente (opcional): passe `selectedItem` (controlado) para marcar o
 * item escolhido como **pressed** e **fixá-lo no topo** da lista — mesmo que ele
 * não venha nos resultados da busca atual. Útil quando a escolha permanece na
 * tela (ex.: escolher a sala e seguir montando algo com ela).
 *
 * Sem label visível (placeholder-only): use `aria-label` ou um Field.
 */
import { useState, type ChangeEvent } from "react";

import { useCombobox } from "../../hooks/useCombobox";
import { SearchBarResults } from "./SearchBarResults";
import { sizeStyles, type SearchBarItem, type SearchBarSize } from "./types";

export type { SearchBarItem, SearchBarSize } from "./types";

export interface SearchBarProps {
  /** Resultados já prontos (a base é controlada; o SearchBarAsync os injeta). */
  items: SearchBarItem[];
  /** SEMPRE dispara ao escolher um item (Enter/click) — caso de ação/navegação. */
  onSelect: (item: SearchBarItem) => void;
  /**
   * Item selecionado (controlado). Quando presente, é fixado no topo da lista com
   * estilo *pressed* e permanece lá em novas buscas, mesmo fora dos resultados.
   * O consumidor tipicamente o define no `onSelect`.
   */
  selectedItem?: SearchBarItem | null;
  /** Avisa mudança do texto digitado (o SearchBarAsync escuta e busca). */
  onQueryChange?: (query: string) => void;
  /** `true` (default) limpa o campo ao escolher; `false` preenche com o `label` (como o Select). */
  clearOnSelect?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Texto do estado "sem resultados". */
  emptyMessage?: string;
  size?: SearchBarSize;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Só para layout externo. */
  className?: string;
}

export function SearchBar({
  items,
  onSelect,
  selectedItem,
  onQueryChange,
  clearOnSelect = true,
  placeholder = "Buscar",
  disabled = false,
  loading = false,
  emptyMessage,
  size = "md",
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  // Com seleção, o item escolhido é fixado no topo (deduplicado dos resultados).
  const displayItems = selectedItem
    ? [selectedItem, ...items.filter((i) => i.value !== selectedItem.value)]
    : items;

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
    itemCount: displayItems.length,
    isItemDisabled: (i) => !!displayItems[i]?.disabled,
    disabled,
    onSelect: selectItem,
    // A SearchBar abre sem item destacado (diferente do Select): o usuário navega
    // com as setas a partir do campo.
    getDefaultActiveIndex: () => -1,
    id,
  });

  function selectItem(index: number) {
    const item = displayItems[index];
    if (!item || item.disabled) return;
    onSelect(item);
    if (clearOnSelect) {
      setQuery("");
      onQueryChange?.("");
    } else {
      // Preenche o campo com o label; não dispara nova busca (não é `onQueryChange`).
      setQuery(item.label);
    }
    closeMenu();
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setQuery(next);
    onQueryChange?.(next);
    setActiveIndex(-1); // texto novo → sem destaque até o usuário navegar
    if (next) {
      if (!open) openMenu();
    } else if (open && !selectedItem) {
      // Sem texto e sem seleção → fecha. Com seleção, mantém aberto mostrando o
      // item fixado no topo.
      closeMenu({ refocus: false });
    }
  }

  const boxClasses = [
    "flex w-full items-center gap-2 rounded-md border-sm transition-colors font-inter",
    "focus-within:ring-2 focus-within:ring-border-focus",
    sizeStyles[size].trigger,
    disabled
      ? "bg-background-default border-border-disabled"
      : "bg-background-surface " +
        (open ? "border-border-focus" : "border-border-default"),
  ].join(" ");

  const inputClasses = [
    "min-w-0 flex-1 border-0 bg-transparent p-0 outline-none appearance-none",
    disabled
      ? "cursor-not-allowed text-text-disabled placeholder:text-text-disabled"
      : "text-text-primary placeholder:text-text-placeholder",
  ].join(" ");

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
          placeholder={placeholder}
          disabled={disabled}
          value={query}
          onChange={onInputChange}
          onFocus={() => {
            inputRef.current?.select();
            if (query || selectedItem) openMenu();
          }}
          onClick={() => {
            if (query || selectedItem) openMenu();
          }}
          className={inputClasses}
        />
      </div>

      {open ? (
        <SearchBarResults
          ref={listRef}
          items={displayItems}
          selectedValue={selectedItem?.value ?? null}
          activeIndex={activeIndex}
          size={size}
          listId={listId}
          optionId={optionId}
          entered={entered}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          onSelect={selectItem}
          onActivate={setActiveIndex}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      ) : null}
    </div>
  );
}
