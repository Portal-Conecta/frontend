"use client";

/**
 * SearchBar — campo de busca com lista rolável de resultados ricos.
 *
 * Inicia **vazio** por padrão; ao digitar, os resultados (`items`) aparecem abaixo
 * numa lista separada por régua (`SearchBarResults`). Com `openOnFocus`, abre já
 * com os `items` como **lista inicial**, antes de digitar. A mecânica de combobox
 * (teclado APG, click-outside, `aria-activedescendant`, scroll do ativo) vem do
 * hook compartilhado `useCombobox` — o mesmo do `Select`, sem reinventar a
 * navegação.
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
  /**
   * Abre a lista **antes de digitar**, mostrando os `items` como lista inicial
   * (ex.: "todas as salas"). São três efeitos — o nome anuncia só o primeiro:
   * abre no foco, abre no clique, e apagar o texto deixa de fechar (volta à
   * lista inicial em vez de sumir).
   *
   * Default `false`: a SearchBar nasce vazia, que é o certo para busca pura —
   * num universo grande, uma "lista inicial" não significaria nada. Ligue quando
   * o conjunto é pequeno e navegável e o usuário precisa **descobrir** o que
   * existe sem adivinhar o termo.
   *
   * Aqui na base os `items` iniciais são responsabilidade do consumidor (basta
   * devolver a lista cheia para query vazia); no `SearchBarAsync`, ligar esta
   * prop também dispara `search("")` na primeira abertura.
   */
  openOnFocus?: boolean;
  /** Avisa abertura/fechamento (o SearchBarAsync usa para carregar ao abrir). */
  onOpenChange?: (open: boolean) => void;
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
  openOnFocus = false,
  onOpenChange,
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

  // Seleção "controlada" = o consumidor passou `selectedItem` (mesmo `null`).
  // Nesse modo a lista permanece aberta após escolher, mostrando o item pinado;
  // sem a prop, a SearchBar age como ação/navegação (fecha ao escolher).
  const isControlledSelection = selectedItem !== undefined;

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
    onOpenChange,
    // A SearchBar abre sem item destacado (diferente do Select): o usuário navega
    // com as setas a partir do campo. Vale também para a lista inicial — destacar
    // de saída faria o Enter escolher algo que o usuário não mirou.
    getDefaultActiveIndex: () => -1,
    id,
  });

  function selectItem(index: number) {
    const item = displayItems[index];
    if (!item || item.disabled) return;
    onSelect(item);

    if (isControlledSelection) {
      // Seleção persistente: o item vira o pinado no topo (pressed). Mantém a lista
      // ABERTA mostrando-o e limpa o texto, pronta para uma nova busca. Não fecha —
      // é o que torna a seleção visível na hora, sem depender de re-foco.
      setQuery("");
      onQueryChange?.("");
      setActiveIndex(-1);
      return;
    }

    // Ação/navegação: limpa ou preenche o campo e fecha a lista.
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
    } else if (open && !selectedItem && !openOnFocus) {
      // Sem texto e sem seleção → fecha. Mantém aberto em dois casos: com seleção
      // (mostrando o item fixado no topo) e com `openOnFocus` — aí apagar o texto
      // volta à lista inicial, já que o `onQueryChange("")` acima avisou o
      // consumidor a repovoar `items`.
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
            if (openOnFocus || query || selectedItem) openMenu();
          }}
          onClick={() => {
            if (openOnFocus || query || selectedItem) openMenu();
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
