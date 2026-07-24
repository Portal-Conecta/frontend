'use client'

/**
 * Formulário de criação de usuário (#441, Figma node 3687:21783 — variante
 * "Default"). Tipo é um `Select` (não os "5 cards" que a issue descrevia —
 * o protótipo real usa dropdown), com as opções restritas por
 * `creatableTypeUsers` (espelha a hierarquia do `UserPermissionValidator` do
 * core-backend: SENAI só cria Estudante/Professor, WEG só Estudante).
 */
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button, Field, Input, Select, type SelectOption } from '@portal/ui'

import { HttpError } from '../http/errors'
import { ROLE_LABELS } from '../profile/roleLabels'
import type { TypeUser } from '../rbac'
import { ImportUsersModal } from './ImportUsersModal'
import { UserFeedbackModal, type UserFeedbackModalVariant } from './UserFeedbackModal'
import { creatableTypeUsers } from './userCreatePermissions'
import { createUserClient } from './usersClient'

export interface CreateUserFormProps {
  requesterType: TypeUser
}

interface FormErrors {
  name?: string
  email?: string
  typeUser?: string
}

export function CreateUserForm({ requesterType }: CreateUserFormProps) {
  const router = useRouter()
  const typeOptions: SelectOption[] = creatableTypeUsers(requesterType).map((type) => ({
    value: type,
    label: ROLE_LABELS[type],
  }))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [typeUser, setTypeUser] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<UserFeedbackModalVariant | null>(null)
  const [createdName, setCreatedName] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  function validate(): boolean {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'Nome é obrigatório.'
    if (!email.trim()) next.email = 'E-mail é obrigatório.'
    if (!typeUser) next.typeUser = 'Tipo é obrigatório.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (saving || !validate()) return

    setSaving(true)
    try {
      const created = await createUserClient({
        name: name.trim(),
        email: email.trim(),
        typeUser: typeUser as TypeUser,
      })
      setCreatedName(created.name)
      setFeedback('success')
    } catch (err) {
      if (err instanceof HttpError && err.kind === 'validation' && err.body?.errors) {
        const fieldErrors: FormErrors = {}
        for (const fieldError of err.body.errors) {
          if (fieldError.field === 'name' || fieldError.field === 'email' || fieldError.field === 'typeUser') {
            fieldErrors[fieldError.field] = fieldError.message
          }
        }
        setErrors(fieldErrors)
      } else {
        setFeedback('error')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleFeedbackClose() {
    const wasSuccess = feedback === 'success'
    setFeedback(null)
    if (wasSuccess) router.push('/usuarios')
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-8 py-4">
      <div className="flex flex-col gap-6">
        <Field label="Nome">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="ex: Ana Almeida"
            disabled={saving}
            {...(errors.name ? { error: errors.name } : {})}
          />
        </Field>

        <Field label="E-mail">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ex: nome_estudante@estudante.sesisenai.org.br"
            disabled={saving}
            {...(errors.email ? { error: errors.email } : {})}
          />
        </Field>

        <Field label="Tipo">
          <Select
            options={typeOptions}
            value={typeUser}
            onChange={setTypeUser}
            placeholder="Selecionar"
            disabled={saving}
            {...(errors.typeUser ? { error: errors.typeUser } : {})}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button
          className="flex-1"
          variant="outlined"
          tone="brand"
          disabled={saving}
          onClick={() => router.push('/usuarios')}
        >
          Cancelar
        </Button>
        <Button
          className="flex-1"
          tone="brand"
          disabled={saving}
          loading={saving}
          onClick={() => void handleSave()}
        >
          Salvar
        </Button>
      </div>

      <Button variant="link" tone="brand" disabled={saving} onClick={() => setImportOpen(true)}>
        Importar usuários por planilha
      </Button>

      <UserFeedbackModal
        open={feedback !== null}
        variant={feedback ?? 'success'}
        userName={createdName}
        onClose={handleFeedbackClose}
      />

      <ImportUsersModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}

export default CreateUserForm
