'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

import { Button, Field, Input } from '@portal/ui'

export interface CreateCourseFormProps {
  /**
   * Adiciona o curso à lista de rascunho. Retorna uma mensagem de erro para o
   * campo código (ex.: código duplicado na lista) ou `null` quando aceito.
   */
  onAdd: (data: { code: string; name: string }) => string | null
  disabled?: boolean
}

/** Formulário "adicionar curso à lista de rascunho" (#358). */
export function CreateCourseForm({ onAdd, disabled = false }: CreateCourseFormProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState({ code: '', name: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedCode = code.trim()
    const trimmedName = name.trim()

    const newErrors = {
      code: trimmedCode ? '' : 'Código é obrigatório.',
      name: trimmedName ? '' : 'Nome é obrigatório.',
    }

    if (newErrors.code || newErrors.name) {
      setErrors(newErrors)
      return
    }

    const addError = onAdd({ code: trimmedCode, name: trimmedName })
    if (addError) {
      setErrors({ code: addError, name: '' })
      return
    }

    setErrors({ code: '', name: '' })
    setCode('')
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <Field label="Código do curso">
        <Input
          value={code}
          disabled={disabled}
          {...(errors.code ? { error: errors.code } : {})}
          placeholder="Ex: DS"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setCode(event.target.value)
            if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
          }}
        />
      </Field>

      <Field label="Nome do curso">
        <Input
          value={name}
          disabled={disabled}
          {...(errors.name ? { error: errors.name } : {})}
          placeholder="Ex: Desenvolvimento de Sistema"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
          }}
        />
      </Field>

      <div className="mt-2">
        <Button type="submit" variant="outlined" iconLeft="plus" disabled={disabled}>
          Adicionar Curso
        </Button>
      </div>
    </form>
  )
}
