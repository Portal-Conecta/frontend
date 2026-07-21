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
 * **Lista inicial** (`openOnFocus`): dispara `search("")` na primeira abertura e
 * guarda o resultado como a lista para onde voltar quando o usuário apagar o
 * texto. O `minChars` continua governando **apenas queries digitadas** — mas com
 * `openOnFocus` o ramo abaixo do limiar passa a mostrar a lista inicial em vez de
 * lista vazia (ex.: `minChars={3}` + 1 caractere digitado). É deliberado: com
 * lista inicial ligada, o usuário nunca deve encarar um menu vazio.
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
  "items" | "loading" | "onQueryChange" | "onOpenChange"
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
  openOnFocus = false,
  ...rest
}: SearchBarAsyncProps) {
  const [items, setItems] = useState<SearchBarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // Sequência da última busca disparada; respostas com seq != atual são ignoradas.
  const seqRef = useRef(0);
  // Lista inicial (resposta de `search("")`) — para onde voltar quando o usuário
  // apaga o texto. Em ref, não em estado: só é lida sob demanda, nunca renderiza.
  const initialItemsRef = useRef<SearchBarItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  /**
   * Busca a lista inicial. Sem debounce (não vem de digitação) e sem guarda de
   * "já carregando" — quem chama é que decide.
   */
  function startInitialFetch() {
    const seq = ++seqRef.current;
    setLoading(true);
    void search("")
      .then((results) => {
        // FORA da guarda de seq: a resposta da query vazia É a lista inicial,
        // mesmo que o usuário já tenha digitado por cima. Cachear sempre é o que
        // garante ter para onde voltar quando ele apagar o texto — diferente do
        // SelectAsync, aqui a lista fica ABERTA e não há segunda abertura para
        // se recuperar.
        initialItemsRef.current = results;
        setLoaded(true);
        // DENTRO da guarda: só exibe se ninguém digitou por cima.
        if (seq === seqRef.current) {
          setItems(results);
          setLoading(false);
        }
      })
      .catch(() => {
        // `loaded` continua false → a próxima abertura tenta de novo (retry
        // implícito, como no SelectAsync).
        if (seq === seqRef.current) {
          setItems([]);
          setLoading(false);
        }
      });
  }

  function onOpenChange(open: boolean) {
    if (open && openOnFocus && !loaded && !loading) startInitialFetch();
  }

  function onQueryChange(query: string) {
    clearTimeout(debounceRef.current);
    const trimmed = query.trim();

    if (trimmed.length < minChars) {
      seqRef.current++; // invalida qualquer resposta em voo
      setLoading(false);
      if (!openOnFocus) {
        setItems([]);
        return;
      }
      // Com lista inicial: volta para ela em vez de esvaziar.
      setItems(loaded ? initialItemsRef.current : []);
      // Se ainda não carregou, o prefetch se perdeu numa corrida com a digitação
      // — refaz. Não se checa `loading`: o seqRef.current++ acima acabou de
      // invalidar tudo que estava em voo, então este refetch é intencional.
      if (!loaded) startInitialFetch();
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
      openOnFocus={openOnFocus}
      items={items}
      loading={loading}
      onQueryChange={onQueryChange}
      onOpenChange={onOpenChange}
    />
  );
}
