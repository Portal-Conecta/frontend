'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createCoursesClient } from '@portal/core/courses/coursesClient'
import { HttpError } from '@portal/core/http/errors'
import { Button, Text } from '@portal/ui'

import { CreateCourseForm } from './CreateCourseForm'
import { DraftCourseList, type DraftCourse } from './DraftCourseList'

/** Mensagem de erro de item quando o back não manda uma específica. */
const ITEM_ERROR_FALLBACK: Record<string, string> = {
  validation: 'Dados inválidos para este curso.',
  server: 'Falha ao criar este curso. Tente novamente.',
}

function duplicateCodeError(drafts: DraftCourse[], code: string, exceptId?: string): string | null {
  const normalized = code.trim().toLowerCase()
  const duplicated = drafts.some(
    (draft) => draft.id !== exceptId && draft.code.trim().toLowerCase() === normalized,
  )
  return duplicated ? 'Já existe um curso com este código na lista.' : null
}

/**
 * Tela de criação em lote (#358): os cursos entram numa lista de rascunho
 * (editável inline) e um botão único persiste todos de uma vez via
 * `POST /api/courses` (batch). No 207 (parcial), os criados saem da lista e os
 * que falharam ficam, com o erro por item, para corrigir e salvar de novo.
 */
export function CriarCursoFormWrapper() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<DraftCourse[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function handleAdd(data: { code: string; name: string }): string | null {
    const duplicated = duplicateCodeError(drafts, data.code)
    if (duplicated) return duplicated

    setDrafts((prev) => [...prev, { id: crypto.randomUUID(), ...data }])
    setFormError('')
    return null
  }

  function handleUpdate(id: string, data: { code: string; name: string }): string | null {
    const duplicated = duplicateCodeError(drafts, data.code, id)
    if (duplicated) return duplicated

    // Editar limpa o erro do item — ele será revalidado no próximo salvamento.
    setDrafts((prev) => prev.map((draft) => (draft.id === id ? { id, ...data } : draft)))
    return null
  }

  function handleRemove(id: string) {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id))
  }

  async function handleSalvarTodos() {
    if (drafts.length === 0) return
    setIsSaving(true)
    setFormError('')

    try {
      const response = await createCoursesClient(
        drafts.map(({ code, name }) => ({ code, name })),
      )

      if (response.errorCount === 0) {
        router.push('/cursos')
        return
      }

      // 207: mantém na lista só os que falharam, com o erro por item.
      const failed = drafts
        .map((draft, index) => ({ draft, result: response.results[index] }))
        .filter(({ result }) => result?.status !== 'created')
        .map(({ draft, result }) => ({
          ...draft,
          error:
            result?.error?.message ??
            ITEM_ERROR_FALLBACK[result?.error?.code ?? 'server'] ??
            'Falha ao criar este curso.',
        }))

      setDrafts(failed)
      setFormError(
        `${response.createdCount} de ${response.results.length} curso(s) criado(s). ` +
          'Corrija os itens abaixo e salve novamente.',
      )
    } catch (err) {
      if (err instanceof HttpError) {
        setFormError(
          err.status === 409
            ? 'Já existe um curso cadastrado com um dos códigos informados.'
            : (err.body?.message ?? 'Falha ao criar os cursos. Verifique os dados e tente novamente.'),
        )
        return
      }
      setFormError('Falha inesperada ao criar os cursos. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <CreateCourseForm onAdd={handleAdd} disabled={isSaving} />

      <div className="flex flex-col gap-4">
        <Text as="h3" variant="body-md-emphasis" tone="brand">
          Cursos a criar ({drafts.length})
        </Text>
        <DraftCourseList
          items={drafts}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          disabled={isSaving}
        />
      </div>

      {formError ? (
        <div role="alert" className="flex items-stretch gap-4">
          <span className="w-[3px] shrink-0 rounded-full bg-feedback-error" aria-hidden="true" />
          <Text variant="label-md" className="text-feedback-error">
            {formError}
          </Text>
        </div>
      ) : null}

      <div className="flex gap-4">
        <Button variant="outlined" onClick={() => router.back()} disabled={isSaving} className="flex-1">
          Descartar alterações
        </Button>
        <Button
          variant="solid"
          onClick={() => void handleSalvarTodos()}
          disabled={drafts.length === 0}
          loading={isSaving}
          className="flex-1"
        >
          Salvar e criar curso
        </Button>
      </div>
    </div>
  )
}
