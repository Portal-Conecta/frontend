'use client'

import { useState } from 'react'

import { Section, Text } from '@portal/ui'

import { AssociateUsersCard } from './AssociateUsersCard'
import { filterMembersByTab } from './turmaMembrosModel'
import type { ClassMember } from './types'

export interface TurmaMembersListProps {
  members: ClassMember[]
  onRemove: (memberId: string) => void
  disabled?: boolean
}

const TAB_OPTIONS = [
  { value: 'STUDENT', label: 'Alunos' },
  { value: 'TEACHER', label: 'Professores' },
] as const

/** Painel esquerdo: quem já está vinculado à turma, com opção de remover. */
export function TurmaMembersList({ members, onRemove, disabled = false }: TurmaMembersListProps) {
  const [tab, setTab] = useState<'STUDENT' | 'TEACHER'>('STUDENT')

  const filtered = filterMembersByTab(members, tab)

  return (
    <div className="flex flex-col gap-4">
      <Section
        value={tab}
        onChange={(value) => setTab(value as 'STUDENT' | 'TEACHER')}
        options={TAB_OPTIONS}
        aria-label="Filtrar membros por papel"
      />

      <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2">
        {filtered.length === 0 ? (
          <Text as="p" variant="body-sm" tone="secondary" className="p-2">
            Nenhum usuário vinculado a esta turma.
          </Text>
        ) : (
          filtered.map((member) => (
            <AssociateUsersCard
              key={member.id}
              name={member.name}
              variant="remove"
              disabled={disabled}
              onAction={() => onRemove(member.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default TurmaMembersList
