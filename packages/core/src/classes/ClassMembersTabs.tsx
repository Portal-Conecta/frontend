'use client'

/**
 * Abas "Alunos" / "Professores" do detalhe da turma.
 *
 * Único pedaço client da tela: os dados vêm prontos do server e o state daqui é
 * só qual aba está aberta. O painel de representantes fica de fora (é estático,
 * renderizado no server).
 *
 * A seleção usa a molecule `Section` do DS — que já entrega régua de seleção,
 * roving tabindex e navegação por setas. Fica registrado que o próprio DS
 * antecipa esta situação: o docstring da `Section` diz que, quando a seleção
 * troca uma região de conteúdo (o caso aqui), o padrão correto passa a ser
 * `tablist`/`tab`/`tabpanel` em vez do `radiogroup` que ela usa. Reimplementar
 * isso no domínio duplicaria a `Section` inteira, então o certo é evoluir o DS
 * (mudança gated pelo squad de Front-End) — não clonar aqui.
 */
import { useState } from 'react'

import { Section, Text } from '@portal/ui'

import { ClassMemberRow } from './ClassMemberRow'
import { TurmaEmptyIllustration } from './TurmaEmptyIllustration'
import type { ClassMember } from './types'

const STUDENTS = 'students'
const TEACHERS = 'teachers'

const TAB_OPTIONS = [
  { value: STUDENTS, label: 'Alunos' },
  { value: TEACHERS, label: 'Professores' },
] as const

export interface ClassMembersTabsProps {
  students: ClassMember[]
  teachers: ClassMember[]
}

export function ClassMembersTabs({ students, teachers }: ClassMembersTabsProps) {
  const [tab, setTab] = useState<string>(STUDENTS)

  const isStudents = tab === STUDENTS
  const members = isStudents ? students : teachers
  const listLabel = isStudents ? 'Alunos da turma' : 'Professores da turma'

  return (
    <div className="flex flex-col">
      <Section
        value={tab}
        onChange={setTab}
        options={TAB_OPTIONS}
        aria-label="Membros da turma"
        className="py-3"
      />

      <div className="mt-4 rounded-md border-sm border-border-default p-2.5">
        {members.length === 0 ? (
          /*
           * Estado vazio composto aqui em vez de usar o `EmptyState` do DS: o
           * molecule fixa o título em `label-md-emphasis` (16px) e exige um
           * `description`, enquanto o design pede `heading-h2` (28px) e não tem
           * segunda linha. Encaixar os dois casos seria mudança no `packages/ui`
           * — gated pelo squad de Front-End (AGENTS.md).
           */
          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
            <TurmaEmptyIllustration aria-hidden="true" className="h-60 w-60" />
            <Text as="p" variant="heading-h2" tone="brand" className="max-w-xs">
              Não tem nada aqui por enquanto :/
            </Text>
          </div>
        ) : (
          <ul aria-label={listLabel}>
            {members.map((member) => (
              <ClassMemberRow key={member.id} member={member} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
