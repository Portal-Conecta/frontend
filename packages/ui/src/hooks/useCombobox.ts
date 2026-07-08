"use client";

/**
 * useCombobox — mecânica genérica de combobox (APG) compartilhada pela família
 * `Select` e pela `SearchBar`.
 *
 * Cuida do que é comum aos dois: estado aberto/fechado, índice ativo com
 * navegação que pula itens desabilitados, teclado (↓↑ Enter Esc Tab), fechar ao
 * clicar fora, `scrollIntoView` do item ativo, animação de entrada (`entered`),
 * os refs (container/input/list) e os ids de acessibilidade (`listId`/`optionId`
 * + as props de `role="combobox"`).
 *
 * **Não** conhece `value`, `label`, texto do input nem filtro — isso é do
 * consumidor. O `closeMenu` daqui só mexe em `open`/`activeIndex`/foco e avisa
 * via `onOpenChange`; reverter/limpar o texto do input é responsabilidade de quem
 * usa (tipicamente reagindo a `open` virar `false`).
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

/** Próximo índice habilitado a partir de `from` (exclusivo) na direção `dir`. */
function nextEnabled(
  count: number,
  isDisabled: (i: number) => boolean,
  from: number,
  dir: 1 | -1,
): number {
  if (count === 0) return -1;
  for (let step = 1; step <= count; step++) {
    const i = (((from + dir * step) % count) + count) % count;
    if (!isDisabled(i)) return i;
  }
  return from;
}

function firstEnabled(
  count: number,
  isDisabled: (i: number) => boolean,
): number {
  for (let i = 0; i < count; i++) if (!isDisabled(i)) return i;
  return -1;
}

function lastEnabled(
  count: number,
  isDisabled: (i: number) => boolean,
): number {
  for (let i = count - 1; i >= 0; i--) if (!isDisabled(i)) return i;
  return -1;
}

export interface UseComboboxParams {
  /** Tamanho da lista corrente (já filtrada, do ponto de vista do consumidor). */
  itemCount: number;
  /** Item `i` está desabilitado? (default: nenhum). Usado na navegação por teclado. */
  isItemDisabled?: ((index: number) => boolean) | undefined;
  disabled?: boolean | undefined;
  /** Enter/click num item ativo — o consumidor decide o efeito (escolher, fechar, limpar…). */
  onSelect: (index: number) => void;
  /** Avisa abertura/fechamento (ex.: SelectAsync carrega ao abrir; SearchBar reverte texto ao fechar). */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Índice ativo ao abrir sem alvo explícito. Se ausente, usa o primeiro
   * habilitado; pode retornar `-1` para abrir **sem** item destacado (ex.: a
   * SearchBar não auto-destaca; o Select destaca o selecionado/primeiro).
   */
  getDefaultActiveIndex?: (() => number) | undefined;
  /** Base para os ids de a11y (default: `useId`). */
  id?: string | undefined;
}

export function useCombobox({
  itemCount,
  isItemDisabled = () => false,
  disabled = false,
  onSelect,
  onOpenChange,
  getDefaultActiveIndex,
  id,
}: UseComboboxParams) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const listId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  function defaultActive(): number {
    // `undefined` (getter ausente) → primeiro habilitado; um número (inclusive -1)
    // é respeitado como veio, deixando o consumidor optar por abrir sem destaque.
    return getDefaultActiveIndex?.() ?? firstEnabled(itemCount, isItemDisabled);
  }

  function openMenu(toIndex?: number) {
    if (disabled || open) return;
    setOpen(true);
    setActiveIndex(toIndex ?? defaultActive());
    onOpenChange?.(true);
  }

  function closeMenu({ refocus = true }: { refocus?: boolean } = {}) {
    setOpen(false);
    setActiveIndex(-1);
    onOpenChange?.(false);
    if (refocus) inputRef.current?.focus();
  }

  // Anima a entrada (fade + slide) no frame seguinte ao montar a lista.
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node))
        closeMenu({ refocus: false });
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Mantém a opção ativa visível.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openMenu();
        else
          setActiveIndex((i) => nextEnabled(itemCount, isItemDisabled, i, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openMenu(lastEnabled(itemCount, isItemDisabled));
        else
          setActiveIndex((i) => nextEnabled(itemCount, isItemDisabled, i, -1));
        break;
      case "Enter":
        if (open) {
          event.preventDefault();
          onSelect(activeIndex);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          closeMenu();
        }
        break;
      case "Tab":
        if (open) closeMenu({ refocus: false });
        break;
      // Home/End não são sequestrados: movem o cursor de texto.
    }
  }

  /** Props de a11y do input `role="combobox"` (o consumidor adiciona value/onChange/placeholder). */
  const comboboxAriaProps = {
    role: "combobox" as const,
    autoComplete: "off" as const,
    "aria-autocomplete": "list" as const,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    "aria-activedescendant":
      open && activeIndex >= 0 && activeIndex < itemCount
        ? optionId(activeIndex)
        : undefined,
    onKeyDown,
  };

  return {
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
    onKeyDown,
    comboboxAriaProps,
  };
}
