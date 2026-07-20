'use client'

/**
 * CourseRow — uma linha da lista de cursos: código │ nome │ ação Gerenciar.
 *
 * Componente do domínio de cursos (nasce no core, issue #357). Código e nome
 * usam `text-text-brand` (blue/500): o Figma pede blue/700, mas não há token de
 * texto blue/700 — mesma dívida conhecida do preenchido de Date/TimeInput
 * (AGENTS, issue #241). Sem hex cru.
 *
 * Responsivo, fiel aos dois frames:
 * - Desktop: código │ nome + botão "Gerenciar" (outlined) à direita.
 * - Mobile: o frame não tem botão na linha — então a **linha inteira** vira o
 *   alvo tocável que abre Gerenciar. Um único elemento interativo por breakpoint
 *   (sem aninhar interativos).
 */
import { Button, Text } from '@portal/ui'

import type { Course } from '../../types'

export interface CourseRowProps {
  course: Course
  /** Abre a tela de gerenciar o curso. */
  onManage: (course: Course) => void
}

/**
 * Código │ nome — compartilhado pelas duas variantes de linha (mobile/desktop).
 *
 * A coluna do código tem **largura fixa** (`w-20`) para que a régua e o nome
 * fiquem alinhados entre todas as linhas, independentemente do tamanho do código
 * (ex.: MIDS vs ADSIS). Régua na cor `border/focus` (blue/500), como no Figma.
 */
function CourseIdentity({ course }: { course: Course }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <Text
        as="span"
        variant="label-md-emphasis"
        tone="brand"
        className="w-20 shrink-0 truncate border-r border-border-focus pr-3 text-left"
      >
        {course.code}
      </Text>
      <Text as="span" variant="label-md" tone="brand" className="min-w-0 truncate text-left">
        {course.name}
      </Text>
    </div>
  )
}

export function CourseRow({ course, onManage }: CourseRowProps) {
  return (
    <>
      {/* Mobile: linha inteira tocável (o frame mobile não tem botão na linha). */}
      <button
        type="button"
        onClick={() => onManage(course)}
        aria-label={`Gerenciar ${course.name}`}
        className="flex h-18 w-full items-center border-b border-border-default bg-background-surface px-3 md:hidden"
      >
        <CourseIdentity course={course} />
      </button>

      {/* Desktop: código │ nome + botão Gerenciar. */}
      <div className="hidden h-18 items-center justify-between gap-3 border-b border-border-default bg-background-surface px-3 md:flex">
        <CourseIdentity course={course} />
        <Button
          variant="outlined"
          size="sm"
          iconLeft="chevron-right"
          onClick={() => onManage(course)}
          className="shrink-0"
        >
          Gerenciar
        </Button>
      </div>
    </>
  )
}
