"use client";

/**
 * SearchBarResults — lista (listbox) presentacional da SearchBar.
 *
 * "Burra" de propósito, como o `SelectList`: não gere foco nem estado aberto — o
 * controle (`SearchBar`) mantém o foco no combobox via `aria-activedescendant` e
 * só passa `activeIndex`, `items` e os callbacks. Diferente do `SelectList`, os
 * resultados são **ricos** (ícone + código + label) e a lista é **separada por
 * régua** (sem caixa boxed), como no protótipo. Rola em `overflow-auto` com
 * altura máxima; o `scrollIntoView` do ativo vem do `useCombobox`.
 *
 * Interna à família: NÃO é exportada no barrel de `molecules`.
 */
import { forwardRef } from "react";

import { Icon } from "../../atoms/Icon";
import { sizeStyles, type SearchBarItem, type SearchBarSize } from "./types";

export interface SearchBarResultsProps {
  items: SearchBarItem[];
  /** Valor do item selecionado (pressed). Espera-se que ele venha primeiro em `items`. */
  selectedValue?: string | null | undefined;
  /** Índice realçado (dirigido pelo teclado/hover do controle). `-1` = nenhum. */
  activeIndex: number;
  size: SearchBarSize;
  listId: string;
  optionId: (index: number) => string;
  /** Liga a animação de entrada (fade + slide) no frame após montar. */
  entered: boolean;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  onSelect: (index: number) => void;
  onActivate: (index: number) => void;
  loading?: boolean | undefined;
  emptyMessage?: string | undefined;
}

export const SearchBarResults = forwardRef<
  HTMLUListElement,
  SearchBarResultsProps
>(function SearchBarResults(
  {
    items,
    selectedValue,
    activeIndex,
    size,
    listId,
    optionId,
    entered,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    onSelect,
    onActivate,
    loading = false,
    emptyMessage = "Nenhum resultado encontrado",
  },
  ref,
) {
  const rowPad = sizeStyles[size].item;
  // Carregando e "sem resultados" compartilham a mesma célula centrada.
  const stateCell =
    "flex items-center justify-center gap-2 px-3 py-4 text-center";

  let body;
  if (loading) {
    body = (
      <li role="presentation" className={`${stateCell} text-text-secondary`}>
        <Icon name="loading-circle" size="sm" decorative />
        <span className="text-label-md font-inter">Carregando…</span>
      </li>
    );
  } else if (items.length === 0) {
    body = (
      <li role="presentation" className={`${stateCell} text-text-placeholder`}>
        <span className="text-label-md font-inter">{emptyMessage}</span>
      </li>
    );
  } else {
    body = items.map((item, index) => {
      const active = index === activeIndex;
      const selected = selectedValue != null && item.value === selectedValue;
      return (
        <li
          key={item.value}
          id={optionId(index)}
          role="option"
          aria-selected={selected}
          aria-disabled={item.disabled || undefined}
          onClick={() => onSelect(index)}
          onMouseEnter={() => !item.disabled && onActivate(index)}
          className={[
            rowPad,
            "flex items-center font-inter transition-colors",
            item.disabled
              ? "cursor-not-allowed text-text-disabled"
              : selected
                ? // Pressed: item escolhido, fixado no topo.
                  "cursor-pointer bg-interactive-subtle font-semibold text-text-brand"
                : "cursor-pointer text-text-primary" +
                  (active ? " bg-background-default" : ""),
          ].join(" ")}
        >
          {item.icon ? (
            <Icon
              name={item.icon}
              size={sizeStyles[size].icon}
              tone="secondary"
              decorative
            />
          ) : null}
          {item.meta ? (
            <span className="shrink-0 text-text-secondary">{item.meta}</span>
          ) : null}
          <span className="truncate">{item.label}</span>
        </li>
      );
    });
  }

  return (
    <ul
      ref={ref}
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-busy={loading || undefined}
      className={[
        "absolute left-0 right-0 z-50 mt-2 max-h-72 w-full overflow-auto",
        "bg-background-surface",
        "divide-y divide-border-default border-b border-border-default",
        "origin-top transition duration-150 ease-out",
        entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
      ].join(" ")}
    >
      {body}
    </ul>
  );
});
