// packages/mapa-salas/src/components/StudentSidebar/StudentSidebar.tsx

import { StudentListItem } from '../StudentListItem'

export type StudentSidebarProps = {
  /** Alunos ainda não alocados em nenhum assento (vindos da API) */
  unassignedStudents: Array<{ id: string; name: string }>
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

export function StudentSidebar({
  unassignedStudents,
  selectedStudentId,
  isEditing,
  onStudentClick,
  className,
}: StudentSidebarProps) {
  const classes = ['h-full overflow-y-auto', className].filter(Boolean).join(' ')

  return (
    <ul className={classes}>
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