'use client'

/**
 * Field — wrapper de campo de formulário: estrutura um `label` em volta de
 * qualquer controle do DS (Input, Select, …), associando-os. Gera o `id` e
 * injeta `id` + `aria-labelledby` no controle filho — `aria-labelledby` garante
 * o nome acessível também para controles `<button>` (ex.: o trigger do Select),
 * onde `<label htmlFor>` não nomeia de forma confiável.
 *
 * Era `FormField` (Input-específico); generalizado para envolver qualquer
 * controle que aceite `id`/`aria-labelledby`. Story em `Componentes/Formulário/
 * Field` (ADR-0011, adendo #3).
 */
import { cloneElement, useId, type ReactElement } from 'react'

import { Text, type InputTone } from '@portal/ui/atoms'

/** Props que o `Field` injeta no controle filho para associá-lo ao label. */
type FieldControlProps = { id?: string; 'aria-labelledby'?: string }

export interface FieldProps {
  label: string
  /** Tom do label: `default` (brand) ou `overlay` (claro, sobre painel colorido). */
  tone?: InputTone
  /** O controle envolvido. Recebe `id` e `aria-labelledby` para associar ao label. */
  children: ReactElement<FieldControlProps>
}

export function Field({ label, tone, children }: FieldProps) {
  const controlId = useId()
  const labelId = `${controlId}-label`
  const labelTone = tone === 'overlay' ? 'inverse' : 'brand'

  return (
    <div className="flex flex-col gap-2">
      <Text as="label" id={labelId} htmlFor={controlId} variant="body-md" tone={labelTone}>
        {label}
      </Text>
      {cloneElement(children, { id: controlId, 'aria-labelledby': labelId })}
    </div>
  )
}
