'use client'

/**
 * Orquestrador da tela de adicionar usuários à turma (#364). Dono do rascunho
 * local: `linkedMembers` é a cópia de trabalho renderizada à esquerda,
 * `originalMembers` é a baseline confirmada no servidor. Adicionar/remover só
 * mexe no rascunho — nenhuma chamada de API acontece até "Salvar Edições".
 *
 * Sem endpoint de lote no BFF (`addClassMember`/`removeClassMember` são
 * um-usuário-por-vez): o save calcula o diff e dispara N chamadas via
 * `Promise.allSettled`. Em caso de falha parcial, só os itens que falharam
 * continuam pendentes — os que deram certo já entram na nova baseline
 * (`applySavedDiff`), então um novo "Salvar Edições" não repete o que já
 * funcionou.
 */
import { useState } from 'react'

import { ConfirmDialog, useToast } from '@portal/ui'

import { HttpError } from '../http/errors'
import type { ClassRole } from '../rbac'
import { addClassMemberClient, removeClassMemberClient } from './classMembersClient'
import { TurmaMemberSearchPanel } from './TurmaMemberSearchPanel'
import { TurmaMembersList } from './TurmaMembersList'
import { applySavedDiff, computeMembersDiff, isMembersDirty } from './turmaMembrosModel'
import type { ClassMember, DirectoryUser } from './types'

export interface TurmaMembrosManagerProps {
  classId: string
  initialMembers: ClassMember[]
}

export function TurmaMembrosManager({ classId, initialMembers }: TurmaMembrosManagerProps) {
  const { toast } = useToast()
  const [originalMembers, setOriginalMembers] = useState(initialMembers)
  const [linkedMembers, setLinkedMembers] = useState(initialMembers)
  const [saving, setSaving] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  // Muda a cada save bem-sucedido — força o painel de busca a refazer a
  // consulta (`withoutActiveClass`), senão quem acabou de ser desvinculado só
  // reaparece como disponível se o admin mexer manualmente na busca/aba.
  const [refreshToken, setRefreshToken] = useState(0)

  const isDirty = isMembersDirty(originalMembers, linkedMembers)
  // Quem foi removido no rascunho (ainda não salvo) — volta a aparecer como
  // disponível na busca sem esperar o "Salvar Edições" (client-side puro).
  const { toRemove: pendingRemovals } = computeMembersDiff(originalMembers, linkedMembers)

  function handleAdd(user: Pick<DirectoryUser, 'id' | 'name'>, classRole: ClassRole) {
    setLinkedMembers((current) =>
      current.some((member) => member.id === user.id)
        ? current
        : [...current, { id: user.id, name: user.name, role: classRole }],
    )
  }

  function handleRemove(memberId: string) {
    setLinkedMembers((current) => current.filter((member) => member.id !== memberId))
  }

  async function handleSave() {
    if (saving || !isDirty) return
    setSaving(true)

    const { toAdd, toRemove } = computeMembersDiff(originalMembers, linkedMembers)
    const results = await Promise.allSettled([
      ...toAdd.map((member) =>
        addClassMemberClient(classId, { userId: member.id, classRole: member.role }),
      ),
      ...toRemove.map((member) => removeClassMemberClient(classId, member.id)),
    ])

    const succeededAdds = toAdd.filter((_, index) => results[index]?.status === 'fulfilled')
    const succeededRemoveIds = toRemove
      .filter((_, index) => results[toAdd.length + index]?.status === 'fulfilled')
      .map((member) => member.id)
    const failedReasons = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => (result.reason instanceof HttpError ? result.reason.body?.message : undefined))
      .filter((message): message is string => Boolean(message))

    const nextBaseline = applySavedDiff(originalMembers, succeededAdds, succeededRemoveIds)
    setOriginalMembers(nextBaseline)
    // Falhas continuam como diff pendente: `linkedMembers` já reflete o estado
    // desejado, só a baseline reconciliou o que o servidor de fato confirmou.

    // Só refaz a busca se algo realmente mudou no servidor — evita um refetch
    // à toa quando tudo falhou (nada mudou pra reaparecer/sumir).
    if (succeededAdds.length > 0 || succeededRemoveIds.length > 0) {
      setRefreshToken((token) => token + 1)
    }

    setSaving(false)

    if (failedReasons.length > 0) {
      // Mostra o motivo real (ex.: "O aluno já possui uma turma ativa.") em vez de
      // um erro genérico — quem ficou pendente continua na lista pra tentar de novo.
      toast.error(`Não foi possível salvar todas as alterações: ${failedReasons.join(' ')}`)
    } else if (results.some((result) => result.status === 'rejected')) {
      toast.error('Não foi possível salvar todas as alterações. Tente novamente.')
    } else {
      toast.success('Alterações salvas.')
    }
  }

  function handleDiscardConfirm() {
    setLinkedMembers(originalMembers)
    setDiscardDialogOpen(false)
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <TurmaMembersList members={linkedMembers} onRemove={handleRemove} disabled={saving} />

      <TurmaMemberSearchPanel
        linkedMembers={linkedMembers}
        pendingRemovals={pendingRemovals}
        onAdd={handleAdd}
        isDirty={isDirty}
        saving={saving}
        onSave={() => void handleSave()}
        onDiscard={() => setDiscardDialogOpen(true)}
        refreshToken={refreshToken}
      />

      <ConfirmDialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
        onConfirm={handleDiscardConfirm}
        subTitle="confirmação de:"
        title="Descartar alterações"
        content="Tem certeza que deseja descartar as alterações feitas nesta turma?"
        labelCancel="Cancelar"
        labelConfirm="Descartar alterações"
        confirmTone="negative"
      />
    </div>
  )
}

export default TurmaMembrosManager
