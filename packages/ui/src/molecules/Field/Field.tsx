'use client'

/**
 * Field — wrapper de campo de formulário: estrutura `label` (associado via
 * `htmlFor`/`id`) em volta de um controle `Input`. Story em
 * `Componentes/Formulário/Field` (ADR-0011, adendo #3).
 *
 * Era `FormField`; renomeado para `Field` por consistência (o nome do
 * componente é em inglês, como os demais do DS).
 */
import { useId } from 'react'

import { Input, Text, type InputProps } from '@portal/ui/atoms'

export interface FieldProps extends Omit<InputProps, 'id'> {
  label: string
}

export function Field({ label, tone, ...inputProps }: FieldProps) {
  const id = useId()
  const labelTone = tone === 'overlay' ? 'inverse' : 'brand'

  return (
    <div className="flex flex-col gap-2">
      <Text as="label" htmlFor={id} variant="body-md" tone={labelTone}>
        {label}
      </Text>
      <Input id={id} {...inputProps} {...(tone !== undefined ? { tone } : {})} />
    </div>
  )
}
