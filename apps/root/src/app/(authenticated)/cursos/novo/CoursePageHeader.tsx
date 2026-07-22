'use client'

import { useRouter } from 'next/navigation'

import { Icon, Text } from '@portal/ui'

export function CoursePageHeader() {
  const router = useRouter()

  return (
    <header>
      <div className="flex min-h-14 items-center gap-2 px-4 md:px-6">
        <button
          type="button"
          aria-label="Voltar para a seção anterior"
          onClick={() => router.back()}
          className="shrink-0 rounded-sm text-interactive-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <Icon name="chevron-left" size="md" decorative />
        </button>
        <Text
          as="h1"
          variant="heading-h3"
          tone="brand"
          className="md:text-heading-h2 lg:text-heading-h2"
        >
          Criar Novo Curso
        </Text>
      </div>
      <div className="mx-8 border-b-sm border-border-default" />
    </header>
  )
}
