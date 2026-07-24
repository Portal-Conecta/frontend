import Link from 'next/link'

import { Icon, Text } from '@portal/ui'

/** Cabeçalho da tela de criação de curso (#358). */
export function CoursePageHeader() {
  return (
    <header>
      <div className="flex min-h-14 items-center gap-2 px-4 md:px-6">
        <Link
          href="/cursos"
          aria-label="Voltar para a lista de cursos"
          className="shrink-0 rounded-sm text-interactive-default transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
        >
          <Icon name="chevron-left" size="md" decorative />
        </Link>
        <Text as="h1" variant="heading-h3" tone="brand" className="md:text-heading-h2">
          Criar Novo Curso
        </Text>
      </div>
      <div className="mx-8 border-b-sm border-border-default" />
    </header>
  )
}
