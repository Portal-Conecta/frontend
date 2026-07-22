'use client'

/**
 * PageEditUserContent — formulário de edição de usuário (#442, Figma node
 * 3687:21527). Só "Nome" é editável (regra do Hub, ver `UpdateUserPayload`);
 * "Ações de risco" dispara operações de ciclo de vida separadas do save do
 * nome — inativar/reativar alternam conforme o status atual; excluir marca
 * `PENDING_DELETION` (irreversível pela UI) e por isso passa por confirmação.
 *
 * O botão "Editar" do cabeçalho fica desabilitado aqui — é o mesmo botão da
 * tela de visualizar (#443), só que já estamos na tela de editar.
 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button, ConfirmDialog, Field, Icon, Input, Text, useToast } from '@portal/ui'

import { HttpError } from '../http/errors'
import type { UserById } from '../profile/types'
import {
  deactivateUserClient,
  deleteUserClient,
  reactivateUserClient,
  updateUserClient,
} from '../users/usersClient'

export interface PageEditUserContentProps {
  user: UserById
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof HttpError && err.body?.message ? err.body.message : fallback
}

export function PageEditUserContent({ user }: PageEditUserContentProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState(user.name)
  const [active, setActive] = useState(user.active)
  const [saving, setSaving] = useState(false)
  const [lifecycleLoading, setLifecycleLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const trimmedName = name.trim()
  const isDirty = trimmedName.length > 0 && trimmedName !== user.name
  const busy = saving || lifecycleLoading

  async function handleSave() {
    if (!isDirty || busy) return
    setSaving(true)
    try {
      await updateUserClient(user.id, { name: trimmedName })
      toast.success('Usuário atualizado.')
      router.push(`/usuarios/${user.id}`)
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível salvar o usuário.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive() {
    if (busy) return
    setLifecycleLoading(true)
    try {
      if (active) {
        await deactivateUserClient(user.id)
        setActive(false)
        toast.success('Usuário inativado.')
      } else {
        await reactivateUserClient(user.id)
        setActive(true)
        toast.success('Usuário reativado.')
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível alterar o status do usuário.'))
    } finally {
      setLifecycleLoading(false)
    }
  }

  async function handleDeleteConfirm() {
    setDeleteDialogOpen(false)
    setLifecycleLoading(true)
    try {
      await deleteUserClient(user.id)
      toast.success('Usuário excluído.')
      router.push('/usuarios')
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível excluir o usuário.'))
      setLifecycleLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`/usuarios/${user.id}`}
            aria-label="Voltar para o perfil do usuário"
            className="inline-flex shrink-0 items-center justify-center rounded-sm text-text-brand transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
          >
            <Icon name="chevron-left" size="lg" decorative />
          </Link>
          <h1 className="truncate text-heading-h2 font-inter text-text-brand">Editar usuário</h1>
        </div>

        <Button iconLeft="square-pen" disabled>
          Editar
        </Button>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 py-4">
        <Field label="Nome">
          <Input value={name} onChange={(event) => setName(event.target.value)} disabled={busy} />
        </Field>

        <div className="flex flex-col gap-2">
          <Text as="p" variant="label-md-emphasis" tone="brand">
            Ações de risco
          </Text>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outlined"
              tone="negative"
              disabled={busy}
              onClick={() => void handleToggleActive()}
            >
              {active ? 'Inativar usuário' : 'Reativar usuário'}
            </Button>
            <Button
              size="sm"
              tone="negative"
              iconLeft="trash-2"
              disabled={busy}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Excluir usuário
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="flex-1"
            variant="outlined"
            tone="brand"
            disabled={busy}
            onClick={() => router.push(`/usuarios/${user.id}`)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="flex-1"
            tone="brand"
            disabled={!isDirty || busy}
            onClick={() => void handleSave()}
          >
            Salvar
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => void handleDeleteConfirm()}
        subTitle="confirmação de:"
        title="Excluir usuário"
        content="Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita por aqui."
        labelCancel="Cancelar"
        labelConfirm="Excluir usuário"
        confirmTone="negative"
      />
    </div>
  )
}

export default PageEditUserContent
