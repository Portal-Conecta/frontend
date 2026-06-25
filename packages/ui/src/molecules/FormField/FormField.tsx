'use client'

import { useId } from 'react'

import { Input, Text, type InputProps } from '@portal/ui/atoms'

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string
}

export function FormField({ label, tone, ...inputProps }: FormFieldProps) {
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
