"use client";

/**
 * SearchBarAsync — variante da SearchBar que busca os resultados no back.
 *
 * Wrapper fino sobre a `SearchBar`: escuta `onQueryChange`, aplica **debounce**,
 * chama `search(query)` e gerencia `loading`. Encapsula duas dores que, senão,
 * cada consumidor reimplementaria:
 * - **Debounce** (default 300ms) + `minChars` (não busca com menos que N chars).
 * - **Last-write-wins**: um contador de sequência descarta respostas obsoletas —
 *   a resposta de "des" não sobrescreve a de "desenv" se chegar atrasada.
 *
 * Em caso de falha, cai no estado vazio (retry na próxima query), espelhando o
 * `SelectAsync`. Estado de erro dedicado fica como evolução futura.
 *
 * Story em `Componentes/Inputs/SearchBar/SearchBarAsync`.
 */
import { useEffect, useRef, useState } from "react";

import {
  SearchBar,
  type SearchBarItem,
  type SearchBarProps,
} from "./SearchBar";

export interface SearchBarAsyncProps extends Omit<
  SearchBarProps,
  "items" | "loading" | "onQueryChange"
> {
  /** Busca os resultados para a query (já com trim). Chamada após o debounce. */
  search: (query: string) => Promise<SearchBarItem[]>;
  /** Atraso do debounce em ms (default 300). */
  debounceMs?: number;
  /** Mínimo de caracteres para disparar a busca (default 1). */
  minChars?: number;
}

export function SearchBarAsync({
  search,
  debounceMs = 300,
  minChars = 1,
  ...rest
}: SearchBarAsyncProps) {
  const [items, setItems] = useState<SearchBarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // Sequência da última busca disparada; respostas com seq != atual são ignoradas.
  const seqRef = useRef(0);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function onQueryChange(query: string) {
    clearTimeout(debounceRef.current);
    const trimmed = query.trim();

    if (trimmed.length < minChars) {
      seqRef.current++; // invalida qualquer resposta em voo
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const seq = ++seqRef.current;
      void search(trimmed)
        .then((results) => {
          if (seq === seqRef.current) {
            setItems(results);
            setLoading(false);
          }
        })
        .catch(() => {
          if (seq === seqRef.current) {
            setItems([]);
            setLoading(false);
          }
        });
    }, debounceMs);
  }

  return (
    <SearchBar
      {...rest}
      items={items}
      loading={loading}
      onQueryChange={onQueryChange}
    />
  );
}
