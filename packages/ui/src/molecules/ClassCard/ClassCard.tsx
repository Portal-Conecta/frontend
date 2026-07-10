/**
 * ClassCard — card com os dados básicos de uma turma: código, curso e turno,
 * separados por divisor vertical (Figma node 2511-20637). Duas variantes:
 * `single` (perfil Estudante, um card solto) e `list` (perfil Professor, N
 * cards sob o título "Turmas"). Presentational — recebe os dados já
 * resolvidos pela página, sem busca própria.
 *
 * Curso truncado por padrão (`truncate` + `flex-1`) para manter o card em uma
 * linha em telas estreitas — decisão em aberto na issue de origem, revisitar
 * se o squad decidir por quebra de linha em vez de truncamento.
 */
import { useId } from 'react'

import { Text } from '@portal/ui/atoms'

export interface ClassCardItem {
  /** Código da turma, ex.: "MIDS - 78". */
  code: string
  course: string
  shift: string
}

interface ClassCardRowProps extends ClassCardItem {
  className?: string | undefined
}

function ClassCardDivider() {
  return <span className="h-4 w-px shrink-0 bg-border-default" aria-hidden="true" />
}

function ClassCardRow({ code, course, shift, className }: ClassCardRowProps) {
  return (
    <div
      className={[
        'flex min-w-0 items-center gap-4 rounded-md bg-background-surface px-6 py-4 shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Text variant="label-md-emphasis" tone="brand" className="shrink-0 whitespace-nowrap">
        {code}
      </Text>
      <ClassCardDivider />
      <Text variant="label-md-emphasis" tone="brand" className="min-w-0 flex-1 truncate text-center">
        {course}
      </Text>
      <ClassCardDivider />
      <Text variant="label-md-emphasis" tone="brand" className="shrink-0 whitespace-nowrap">
        {shift}
      </Text>
    </div>
  )
}

export interface ClassCardSingleProps {
  variant?: 'single'
  item: ClassCardItem
  className?: string
}

export interface ClassCardListProps {
  variant: 'list'
  items: ClassCardItem[]
  /** Título da seção. Default "Turmas". */
  title?: string
  className?: string
}

export type ClassCardProps = ClassCardSingleProps | ClassCardListProps

export function ClassCard(props: ClassCardProps) {
  const titleId = useId()

  if (props.variant === 'list') {
    const { items, title = 'Turmas', className } = props

    return (
      <section
        aria-labelledby={titleId}
        className={['rounded-lg bg-background-default p-6', className].filter(Boolean).join(' ')}
      >
        <Text id={titleId} as="h2" variant="label-md-emphasis" tone="brand">
          {title}
        </Text>
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={`${item.code}-${index}`}>
              <ClassCardRow {...item} />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const { item, className } = props
  return <ClassCardRow {...item} className={className} />
}
