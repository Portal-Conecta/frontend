'use client'

import { useId } from 'react'

import { Input, Text, type InputProps } from '@portal/ui/atoms'

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string
}

export function FormField({ label, ...inputProps }: FormFieldProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <Text as="label" htmlFor={id} variant="body-md" tone="brand">
        {label}
      </Text>
      <Input id={id} {...inputProps} />
    </div>
  )
}
