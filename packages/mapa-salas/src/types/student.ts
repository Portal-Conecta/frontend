/**
 * Tipo compartilhado de aluno não alocado.
 * Usado por StudentSidebar e MapGrid para evitar que cada
 * componente use um formato diferente (ex: id/name vs
 * studentId/studentName), o que forçaria o useMapaDeSala
 * a ficar traduzindo entre as duas formas.
 */
export type UnassignedStudent = {
  /** Id único do aluno, vindo da API */
  id: string
  /** Nome do aluno, exibido na lista/sidebar */
  name: string
}

