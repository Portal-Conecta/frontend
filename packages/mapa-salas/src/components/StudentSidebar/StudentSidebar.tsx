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
  className?: string
}

/**
 * StudentSidebar não usa hooks e não é 'use client' por si só,
 * mas recebe `onStudentClick` como função via prop — precisa ser
 * renderizado dentro de uma árvore Client Component, ou o Next
 * vai falhar em runtime ao tentar serializar a função.
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
  className,
}: StudentSidebarProps) {
  const classes = ['h-full overflow-y-auto', className].filter(Boolean).join(' ')

  return (
    <ul className={classes} aria-label="Alunos não alocados">
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
