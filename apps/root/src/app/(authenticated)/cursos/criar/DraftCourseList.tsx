'use client'

import { useState, type ChangeEvent } from 'react'

import { Button, Input, Text } from '@portal/ui'

/** Curso na lista de rascunho, antes de persistir. */
export interface DraftCourse {
  /** Id local do rascunho (não é o id do curso — ele ainda não existe no back). */
  id: string
  code: string
  name: string
  /** Erro do back para este item no salvamento parcial (207). */
  error?: string
}

export interface DraftCourseListProps {
  items: DraftCourse[]
  /**
   * Confirma a edição inline. Retorna mensagem de erro para o campo código
   * (ex.: código duplicado na lista) ou `null` quando aceito.
   */
  onUpdate: (id: string, data: { code: string; name: string }) => string | null
  onRemove: (id: string) => void
  disabled?: boolean
}

/**
 * Lista de rascunho de cursos (#358): modo leitura (código — nome + ações de
 * editar/remover) e modo edição inline (lápis), um item por vez.
 */
export function DraftCourseList({ items, onUpdate, onRemove, disabled = false }: DraftCourseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <Text as="p" variant="body-sm" tone="secondary">
        Nenhum curso adicionado ainda. Preencha os campos acima e clique em “Adicionar Curso”.
      </Text>
    )
  }

  return (
    <ul className="flex w-full flex-col divide-y divide-border-default rounded-md border-sm border-border-default">
      {items.map((item) =>
        editingId === item.id ? (
          <DraftCourseEditRow
            key={item.id}
            item={item}
            disabled={disabled}
            onConfirm={(data) => {
              const error = onUpdate(item.id, data)
              if (!error) setEditingId(null)
              return error
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <DraftCourseReadRow
            key={item.id}
            item={item}
            disabled={disabled}
            onEdit={() => setEditingId(item.id)}
            onRemove={() => onRemove(item.id)}
          />
        ),
      )}
    </ul>
  )
}

function DraftCourseReadRow({
  item,
  disabled,
  onEdit,
  onRemove,
}: {
  item: DraftCourse
  disabled: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <Text as="p" variant="label-md-emphasis" tone="brand" className="truncate">
          {item.code} — {item.name}
        </Text>
        {item.error ? (
          <Text as="p" variant="label-xs" className="mt-1 text-feedback-error">
            {item.error}
          </Text>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon="square-pen"
          aria-label={`Editar curso ${item.code}`}
          onClick={onEdit}
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          tone="negative"
          icon="trash-2"
          aria-label={`Remover curso ${item.code}`}
          onClick={onRemove}
          disabled={disabled}
        />
      </div>
    </li>
  )
}

function DraftCourseEditRow({
  item,
  disabled,
  onConfirm,
  onCancel,
}: {
  item: DraftCourse
  disabled: boolean
  onConfirm: (data: { code: string; name: string }) => string | null
  onCancel: () => void
}) {
  const [code, setCode] = useState(item.code)
  const [name, setName] = useState(item.name)
  const [errors, setErrors] = useState({ code: '', name: '' })

  function handleConfirm() {
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

    const confirmError = onConfirm({ code: trimmedCode, name: trimmedName })
    if (confirmError) setErrors({ code: confirmError, name: '' })
  }

  return (
    <li className="flex flex-col gap-3 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={code}
          disabled={disabled}
          {...(errors.code ? { error: errors.code } : {})}
          aria-label="Código do curso"
          className="sm:max-w-30"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setCode(event.target.value)
            if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
          }}
        />
        <Input
          value={name}
          disabled={disabled}
          {...(errors.name ? { error: errors.name } : {})}
          aria-label="Nome do curso"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
          }}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="solid" size="sm" onClick={handleConfirm} disabled={disabled}>
          Confirmar
        </Button>
        <Button variant="outlined" size="sm" onClick={onCancel} disabled={disabled}>
          Cancelar
        </Button>
      </div>
    </li>
  )
}
