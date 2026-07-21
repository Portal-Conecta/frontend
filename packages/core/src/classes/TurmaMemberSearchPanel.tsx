'use client'

/**
 * Painel direito da tela de adicionar usuários (#364): busca no diretório do
 * sistema, com abas Professores/Alunos, e os botões "Salvar Edições"/
 * "Descartar alterações" (Figma: ficam alinhados embaixo desta coluna, não
 * numa barra full-width).
 *
 * Aba Alunos: além de `withoutActiveClass` (sem turma ativa), busca por
 * `status=[PENDING_ACTIVATION, ACTIVE]` — sem isso o backend usa o default
 * (só ACTIVE) e esconde alunos que ainda não ativaram a conta, mas que já
 * podem ser vinculados a uma turma.
 */
import { useEffect, useRef, useState } from 'react'

import { Button, Input, Pagination, Text } from '@portal/ui'

import type { ClassRole } from '../rbac'
import { AssociateUsersCard } from './AssociateUsersCard'
import { draftFreedMembers, excludeLinkedUsers } from './turmaMembrosModel'
import type { ClassMember, DirectoryUser } from './types'
import { searchUsersClient } from './userDirectoryClient'

export interface TurmaMemberSearchPanelProps {
  linkedMembers: ClassMember[]
  /** Removidos do rascunho (ainda não salvos) — reoferecidos na busca sem depender do backend. */
  pendingRemovals: ClassMember[]
  onAdd: (user: Pick<DirectoryUser, 'id' | 'name'>, classRole: ClassRole) => void
  isDirty: boolean
  saving: boolean
  onSave: () => void
  onDiscard: () => void
  /** Muda a cada save bem-sucedido — força a busca a refazer a consulta. */
  refreshToken: number
}

const SEARCH_DEBOUNCE_MS = 300
const PAGE_SIZE = 10

export function TurmaMemberSearchPanel({
  linkedMembers,
  pendingRemovals,
  onAdd,
  isDirty,
  saving,
  onSave,
  onDiscard,
  refreshToken,
}: TurmaMemberSearchPanelProps) {
  const [tab, setTab] = useState<ClassRole>('STUDENT')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seqRef = useRef(0)

  // Troca de aba ou de busca reseta pra página 1 e dispara nova busca (com debounce).
  useEffect(() => {
    setPage(1)
  }, [tab, query])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const seq = ++seqRef.current
      setLoading(true)
      searchUsersClient({
        typeUser: tab,
        search: query,
        page: page - 1,
        size: PAGE_SIZE,
        withoutActiveClass: tab === 'STUDENT',
        ...(tab === 'STUDENT' ? { status: ['PENDING_ACTIVATION', 'ACTIVE'] } : {}),
      })
        .then((result) => {
          if (seq !== seqRef.current) return
          setUsers(result.content)
          setTotalElements(result.totalElements)
        })
        .catch(() => {
          if (seq !== seqRef.current) return
          setUsers([])
          setTotalElements(0)
        })
        .finally(() => {
          if (seq !== seqRef.current) return
          setLoading(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [tab, query, page, refreshToken])

  // Quem foi removido no rascunho aparece primeiro (client-side, sem esperar
  // save/refetch); o resto vem da busca real no backend.
  // `tab` deste painel só assume STUDENT/TEACHER (os dois botões abaixo) —
  // REPRESENTATIVE nunca é selecionado aqui, mas o estado é tipado como
  // `ClassRole` (mesmo tipo do `classRole` repassado a `onAdd`).
  const freed = draftFreedMembers(pendingRemovals, tab as 'STUDENT' | 'TEACHER', query)
  const results = [...freed, ...excludeLinkedUsers(users, linkedMembers)]

  return (
    <div className="flex flex-col gap-4">
      <Text as="p" variant="label-md-emphasis" tone="brand">
        Buscar no sistema
      </Text>

      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar usuário pelo nome"
        iconRight="search"
        disabled={saving}
        aria-label="Buscar usuário pelo nome"
      />

      <div className="flex items-center gap-3">
        <Button
          variant={tab === 'TEACHER' ? 'solid' : 'outlined'}
          tone="brand"
          className="flex-1"
          disabled={saving}
          onClick={() => setTab('TEACHER')}
        >
          Professores
        </Button>
        <Button
          variant={tab === 'STUDENT' ? 'solid' : 'outlined'}
          tone="brand"
          className="flex-1"
          disabled={saving}
          onClick={() => setTab('STUDENT')}
        >
          Alunos
        </Button>
      </div>

      <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2">
        {loading ? (
          <Text as="p" variant="body-sm" tone="secondary" className="p-2">
            Carregando usuários…
          </Text>
        ) : results.length === 0 ? (
          <Text as="p" variant="body-sm" tone="secondary" className="p-2">
            Nenhum usuário encontrado.
          </Text>
        ) : (
          results.map((user) => (
            <AssociateUsersCard
              key={user.id}
              name={user.name}
              variant="add"
              disabled={saving}
              onAction={() => onAdd(user, tab)}
            />
          ))
        )}
      </div>

      <Pagination
        currentPage={page}
        pageSize={PAGE_SIZE}
        totalItems={totalElements}
        onPageChange={setPage}
        disabled={saving || loading}
      />

      <div className="mt-4 flex items-center justify-end gap-3">
        <Button variant="outlined" disabled={!isDirty || saving} onClick={onDiscard}>
          Descartar alterações
        </Button>
        <Button tone="brand" disabled={!isDirty || saving} onClick={onSave}>
          Salvar Edições
        </Button>
      </div>
    </div>
  )
}

export default TurmaMemberSearchPanel
