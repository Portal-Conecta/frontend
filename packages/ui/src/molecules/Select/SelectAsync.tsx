'use client'

/**
 * SelectAsync — variante do Select que carrega as opções de forma assíncrona.
 *
 * Wrapper fino sobre o `Select`: gerencia `options/loading` e os repassa, então
 * input, filtro, teclado e clearable não são reimplementados. Carrega ao abrir
 * pela 1ª vez (`onOpenChange`). Em caso de falha, a lista cai no estado único
 * "Nenhuma opção encontrada" (sem UI de erro dedicada); como `loaded` só vira
 * `true` no sucesso, reabrir tenta de novo — retry implícito.
 *
 * Story em `Componentes/Inputs/Select/SelectAsync` (ADR-0011, adendo #2).
 */
import { useState } from 'react'

import { Select } from './Select'
import type { SelectOption, SelectSize } from './types'

export interface SelectAsyncProps {
  /** Carrega as opções — chamado ao abrir pela 1ª vez (e de novo se a anterior falhou). */
  loadOptions: () => Promise<SelectOption[]>
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  /** Erro de validação do campo (barra inferior), distinto da falha de carregamento. */
  error?: string
  clearable?: boolean
  size?: SelectSize
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

export function SelectAsync({ loadOptions, ...rest }: SelectAsyncProps) {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function fetchOptions() {
    setLoading(true)
    try {
      setOptions(await loadOptions())
      setLoaded(true)
    } catch {
      // Sem UI de erro dedicada: a lista vazia mostra "Nenhuma opção encontrada".
      // `loaded` permanece false → a próxima abertura tenta de novo.
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      {...rest}
      options={options}
      loading={loading}
      onOpenChange={(open) => {
        if (open && !loaded && !loading) void fetchOptions()
      }}
    />
  )
}
