/**
 * Tabela papel → permissões — fonte ÚNICA da matriz de RBAC no front.
 *
 * Espelha as allow-lists hardcoded nos validators do backend (Java). Como o back
 * não serve a matriz, o front a mantém aqui; quando o backend expuser as permissões
 * (endpoint `/me` rico ou `@PreAuthorize`), só o BFF que monta o `CurrentUser` muda.
 *
 * Lembre-se: isto é UX (esconder/desabilitar). O gate real é o 403 do backend, que
 * valida o token em toda chamada. Divergência aqui degrada a experiência, não a
 * segurança. Editar uma linha muda Sidebar, guards e páginas de erro juntos.
 *
 * Regras de produto embutidas:
 * - `comunicados:ver` / `mapa:ver` → todo usuário autenticado.
 * - `checklist:ver` → todos menos o aluno comum (`STUDENT`).
 * - `checklist:gerenciar` (triagem de não conformidades) → professor + equipe
 *   (TEACHER, SENAI, WEG, ADMIN) — não o representante, que só preenche.
 * - `checklist:dashboard` → gestão SENAI / WEG / ADMIN (painel agregado).
 * - `*:gerenciar` / `usuarios:listar` → equipe (SENAI, WEG, ADMIN).
 * - `matriculas:gerenciar` → apenas SENAI e ADMIN (WEG não).
 */
import type { Permission, TypeUser } from './types'

export const rolePermissions: Record<TypeUser, readonly Permission[]> = {
  STUDENT: ['comunicados:ver', 'mapa:ver'],
  REPRESENTATIVE: ['comunicados:ver', 'mapa:ver', 'checklist:ver'],
  TEACHER: ['comunicados:ver', 'mapa:ver', 'checklist:ver', 'checklist:gerenciar'],
  SENAI: [
    'comunicados:ver',
    'mapa:ver',
    'checklist:ver',
    'checklist:gerenciar',
    'checklist:dashboard',
    'usuarios:listar',
    'usuarios:gerenciar',
    'salas:gerenciar',
    'cursos:gerenciar',
    'turmas:gerenciar',
    'matriculas:gerenciar',
  ],
  WEG: [
    'comunicados:ver',
    'mapa:ver',
    'checklist:ver',
    'checklist:gerenciar',
    'checklist:dashboard',
    'usuarios:listar',
    'usuarios:gerenciar',
    'salas:gerenciar',
    'cursos:gerenciar',
    'turmas:gerenciar',
  ],
  ADMIN: [
    'comunicados:ver',
    'mapa:ver',
    'checklist:ver',
    'checklist:gerenciar',
    'checklist:dashboard',
    'usuarios:listar',
    'usuarios:gerenciar',
    'salas:gerenciar',
    'cursos:gerenciar',
    'turmas:gerenciar',
    'matriculas:gerenciar',
  ],
}

/** Resolve a lista de permissões globais de um papel. */
export function resolvePermissions(userType: TypeUser): Permission[] {
  return [...rolePermissions[userType]]
}
