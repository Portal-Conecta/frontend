/**
 * Testes da tabela papel→permissão. Cobre as regras de produto embutidas na matriz
 * (ADR-0014): quem vê o quê e as exceções (checklist sem aluno comum, matrículas só
 * SENAI/ADMIN). É a rede de segurança contra edições acidentais da tabela.
 */
import { describe, expect, it } from 'vitest'

import { resolvePermissions } from '@portal/core/rbac'

describe('resolvePermissions', () => {
  it('aluno comum vê só comunicados e mapa (sem checklist)', () => {
    const perms = resolvePermissions('STUDENT')
    expect(perms).toEqual(['comunicados:ver', 'mapa:ver'])
    expect(perms).not.toContain('checklist:ver')
  })

  it('checklist é visível a todos menos o aluno comum', () => {
    expect(resolvePermissions('STUDENT')).not.toContain('checklist:ver')
    for (const role of ['REPRESENTATIVE', 'TEACHER', 'SENAI', 'WEG', 'ADMIN'] as const) {
      expect(resolvePermissions(role)).toContain('checklist:ver')
    }
  })

  it('dashboard de checklist é só SENAI, WEG e ADMIN', () => {
    for (const role of ['STUDENT', 'REPRESENTATIVE', 'TEACHER'] as const) {
      expect(resolvePermissions(role)).not.toContain('checklist:dashboard')
    }
    for (const role of ['SENAI', 'WEG', 'ADMIN'] as const) {
      expect(resolvePermissions(role)).toContain('checklist:dashboard')
    }
  })

  it('gestão (usuarios/salas/cursos/turmas) é só da equipe', () => {
    for (const role of ['STUDENT', 'REPRESENTATIVE', 'TEACHER'] as const) {
      expect(resolvePermissions(role)).not.toContain('salas:gerenciar')
    }
    for (const role of ['SENAI', 'WEG', 'ADMIN'] as const) {
      expect(resolvePermissions(role)).toContain('salas:gerenciar')
    }
  })

  it('gerenciar matrículas é só SENAI e ADMIN — WEG não', () => {
    expect(resolvePermissions('SENAI')).toContain('matriculas:gerenciar')
    expect(resolvePermissions('ADMIN')).toContain('matriculas:gerenciar')
    expect(resolvePermissions('WEG')).not.toContain('matriculas:gerenciar')
  })

  it('retorna uma cópia nova (mutar o resultado não afeta a tabela)', () => {
    const a = resolvePermissions('ADMIN')
    a.push('comunicados:ver')
    expect(resolvePermissions('ADMIN')).not.toEqual(a)
  })
})
