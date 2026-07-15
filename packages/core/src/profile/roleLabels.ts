/** Rótulos PT-BR exibidos na página de perfil para cada `TypeUser`. */
import type { TypeUser } from '../rbac'

export const ROLE_LABELS: Record<TypeUser, string> = {
  STUDENT: 'Estudante',
  TEACHER: 'Professor',
  SENAI: 'SENAI',
  WEG: 'WEG',
  REPRESENTATIVE: 'Representante de Turma',
  ADMIN: 'Administrador',
}
