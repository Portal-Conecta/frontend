'use client'

import type { MouseEvent } from 'react'

import { StudentListItem } from '../StudentListItem'
import type { UnassignedStudent } from '../../types/student'

export type StudentSidebarProps = {
  /** Alunos ainda não alocados em nenhum assento (vindos da API) */
  unassignedStudents: UnassignedStudent[]
  /**
   * Id do aluno atualmente selecionado para alocação.
   * null quando nenhum aluno está selecionado.
   */
  selectedStudentId: string | null
  /**
   * Habilita seleção de aluno (clique) e o destaque visual correspondente.
   * Controlado pelo modo edição via useMapaDeSala.
   */
  isEditing: boolean
  /**
   * Disparado ao clicar em um aluno da lista, em modo edição.
   * Toda lógica de seleção/desseleção/swap fica no useMapaDeSala —
   * este componente não guarda estado próprio.
   */
  onStudentClick?: (studentId: string) => void
  /**
   * Disparado ao clicar na área vazia da lista (fora de qualquer item),
   * em modo edição. Usado pelo `useMapaDeSala.handleBenchClick` para
   * devolver ao banco o aluno selecionado que estava sentado num assento.
   */
  onEmptyAreaClick?: () => void
  className?: string
}

/**
 * StudentSidebar não usa hooks, mas anexa `onClick` diretamente no <ul>
 * (para distinguir clique na área vazia de clique num item via
 * `event.target === event.currentTarget`) — isso exige 'use client'
 * (AGENTS.md: define handler de evento direto em elemento DOM).
 *
 * Nota de acessibilidade: o <ul> usa aria-label como rótulo mínimo.
 * Migração completa para role="listbox" (conforme comentário do
 * StudentListItem) fica como follow-up — TODO(#231).
 */
export function StudentSidebar({
  unassignedStudents,
  selectedStudentId,
  isEditing,
  onStudentClick,
  onEmptyAreaClick,
  className,
}: StudentSidebarProps) {
  const classes = ['h-full overflow-y-auto', className].filter(Boolean).join(' ')

  // Clique num <li> borbulha até aqui — só dispara onEmptyAreaClick quando o
  // alvo é o próprio <ul> (área vazia), não um item da lista.
  function handleContainerClick(event: MouseEvent<HTMLUListElement>) {
    if (!isEditing) return
    if (event.target === event.currentTarget) onEmptyAreaClick?.()
  }

  return (
    <ul className={classes} aria-label="Alunos não alocados" onClick={handleContainerClick}>
      {unassignedStudents.map((student) => (
        <StudentListItem
          key={student.id}
          name={student.name}
          isHighlighted={student.id === selectedStudentId}
          isEditing={isEditing}
          onClick={() => onStudentClick?.(student.id)}
        />
      ))}
    </ul>
  )
}
