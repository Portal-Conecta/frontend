'use client'

/**
 * ClassCard — card com os dados básicos de uma turma: código, curso e turno,
 * separados por divisor vertical (Figma node 2511-20637). Duas variantes:
 * `single` (perfil Estudante, um card solto) e `list` (perfil Professor, N
 * cards sob o título "Turmas"). Presentational — recebe os dados já
 * resolvidos pela página, sem busca própria.
 *
 * Código/curso/turno usam CSS Grid com colunas compartilhadas no container
 * (`subgrid` em cada card, trilhas definidas no wrapper), não largura fixa em
 * px por célula — code/shift dimensionam pelo conteúdo, como colunas de
 * tabela, então os divisores ficam alinhados entre linhas de uma lista mesmo
 * com turmas de tamanhos diferentes. O curso ocupa o espaço restante
 * (`minmax(0,1fr)`) e quebra linha (`break-words`) em vez de truncar.
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

function ClassCardRow({ code, course, shift, className }: ClassCardRowProps) {
  return (
    <div
      className={[
        'col-span-3 grid min-w-0 grid-cols-subgrid items-center gap-x-6 rounded-md bg-background-surface px-3 py-6 shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center self-stretch border-r border-border-default pr-6">
        <Text variant="label-sm" tone="brand" className="break-words text-center">
          {code}
        </Text>
      </div>
      <Text variant="label-sm" tone="brand" className="min-w-0 break-words text-center">
        {course}
      </Text>
      <div className="flex items-center self-stretch border-l border-border-default pl-6">
        <Text variant="label-sm" tone="brand" className="break-words text-center">
          {shift}
        </Text>
      </div>
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
        <ul className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-6 gap-y-3">
          {items.map((item, index) => (
            <li key={`${item.code}-${index}`} className="contents">
              <ClassCardRow {...item} />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const { item, className } = props
  return (
    <div className="grid grid-cols-[auto_auto_auto] justify-center gap-x-6">
      <ClassCardRow {...item} className={className} />
    </div>
  )
}
