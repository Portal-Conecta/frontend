'use client'

/**
 * SelectAsync — variante do Select que carrega as opções de forma assíncrona.
 *
 * Wrapper fino sobre o `Select`: gerencia `options/loading/loadError` e os
 * repassa, então trigger, teclado e clearable não são reimplementados. Carrega
 * ao abrir pela 1ª vez (`onOpenChange`) e re-busca pelo botão de atualizar
 * (`onRefresh`/`onRetry`), que reusa o `loading-circle` girando — sem ícone novo.
 *
 * Story em `Componentes/Inputs/Select/SelectAsync` (ADR-0011, adendo #2).
 */
import { useState } from 'react'

import { Select } from './Select'
import type { SelectOption, SelectSize } from './types'

export interface SelectAsyncProps {
  /** Carrega as opções — chamado ao abrir pela 1ª vez e no atualizar. */
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
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [loaded, setLoaded] = useState(false)

  async function fetchOptions() {
    setLoading(true)
    setLoadError(undefined)
    try {
      setOptions(await loadOptions())
      setLoaded(true)
    } catch {
      setLoadError('Falha ao carregar as opções.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      {...rest}
      options={options}
      loading={loading}
      loadError={loadError}
      onRetry={fetchOptions}
      onRefresh={fetchOptions}
      emptyMessage="Nenhuma opção"
      onOpenChange={(open) => {
        if (open && !loaded && !loading) void fetchOptions()
      }}
    />
  )
}
