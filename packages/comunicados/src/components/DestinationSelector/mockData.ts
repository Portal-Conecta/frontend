/**
 * Dados de exemplo para Storybook do `DestinationSelector`.
 * Em produção, cursos/turmas/usuários vêm do Hub via BFF; turnos do enum `Shift`.
 */
import type { SelectOption } from '@portal/ui'

import { HUB_SHIFT_OPTIONS } from '../../constants/hubShifts'

import type { UserSummary } from './types'

export const mockCourses: SelectOption[] = [
  { value: 'curso-ds', label: 'Desenvolvimento de Sistemas' },
  { value: 'curso-eletro', label: 'Eletromecânica' },
  { value: 'curso-adm', label: 'Administração' },
  { value: 'curso-logistica', label: 'Logística' },
  { value: 'curso-mecatronica', label: 'Mecatrônica' },
]

export const mockClasses: SelectOption[] = [
  { value: 'turma-ds-2026', label: 'DS 2026' },
  { value: 'turma-ds-2027', label: 'DS 2027' },
  { value: 'turma-eletro-2026', label: 'Eletromecânica 2026' },
  { value: 'turma-adm-2025', label: 'ADM 2025' },
]

export const mockShifts: SelectOption[] = HUB_SHIFT_OPTIONS

export const mockUsers: UserSummary[] = [
  { id: 'u-01', name: 'Ana Beatriz Souza', role: 'Aluno · DS 2026' },
  { id: 'u-02', name: 'André Martins Lima', role: 'Professor · Eletromecânica' },
  { id: 'u-03', name: 'Bruno Carvalho', role: 'Aluno · ADM 2025' },
  { id: 'u-04', name: 'Camila Ferreira', role: 'Representante · DS 2027' },
  { id: 'u-05', name: 'Carlos Eduardo Nunes', role: 'Aluno · Logística' },
  { id: 'u-06', name: 'Daniela Rocha', role: 'Professor · Administração' },
  { id: 'u-07', name: 'Eduardo Prado', role: 'Aluno · Mecatrônica' },
  { id: 'u-08', name: 'Fernanda Alves', role: 'Aluno · DS 2026' },
  { id: 'u-09', name: 'Gabriel Henrique Dias', role: 'Representante · Eletromecânica 2026' },
  { id: 'u-10', name: 'Helena Barros', role: 'Professor · Logística' },
  { id: 'u-11', name: 'Igor Ramos', role: 'Aluno · ADM 2025' },
  { id: 'u-12', name: 'Juliana Castro', role: 'Aluno · DS 2027' },
  { id: 'u-13', name: 'Larissa Mendes', role: 'Aluno · Mecatrônica' },
  { id: 'u-14', name: 'Lucas Oliveira', role: 'Representante · DS 2026' },
  { id: 'u-15', name: 'Marcela Pinto', role: 'Professor · Mecatrônica' },
  { id: 'u-16', name: 'Mateus Ribeiro', role: 'Aluno · Eletromecânica 2026' },
  { id: 'u-17', name: 'Natália Gomes', role: 'Aluno · Logística' },
  { id: 'u-18', name: 'Otávio Freitas', role: 'Aluno · ADM 2025' },
  { id: 'u-19', name: 'Patrícia Lopes', role: 'Professor · DS 2027' },
  { id: 'u-20', name: 'Rafael Cardoso', role: 'Aluno · DS 2026' },
  { id: 'u-21', name: 'Sofia Almeida', role: 'Representante · Logística' },
  { id: 'u-22', name: 'Thiago Moraes', role: 'Aluno · Mecatrônica' },
  { id: 'u-23', name: 'Vinícius Teixeira', role: 'Aluno · Eletromecânica 2026' },
]
