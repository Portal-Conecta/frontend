'use client'

/**
 * TurmaSearchField — busca da lista de turmas por nome/código.
 *
 * Espelha `UsersSearchField`/`CourseSearchField`: lupa à esquerda, campo
 * full-width `rounded-lg` com borda focus e o mesmo padding (`px-6 py-3`), para
 * o campo de busca ficar idêntico ao das telas de Usuários e Cursos. O átomo
 * `Input` do DS expõe ícone só à direita e tem padding menor (`h-9 px-3`), então
 * compomos aqui reusando as mesmas classes de token — sem tocar em `packages/ui`.
 *
 * Controlado: recebe `value` e emite `onChange`. Debounce/filtro vivem na página.
 */
import { Icon } from '@portal/ui'

export interface TurmaSearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function TurmaSearchField({
  value,
  onChange,
  placeholder = 'Buscar turma',
  className,
  id,
}: TurmaSearchFieldProps) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg border-sm px-6 py-3 transition-colors',
        'bg-background-surface border-border-focus focus-within:ring-2 focus-within:ring-border-focus',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="shrink-0 text-text-brand">
        <Icon name="search" size="md" decorative />
      </span>
      <input
        id={id}
        type="search"
        aria-label="Buscar turmas"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // `type=search` traz um botão de limpar nativo (✕) no WebKit/Chrome que
        // não existe no protótipo — suprimido para manter a fidelidade.
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-label-md font-inter text-text-primary outline-none placeholder:text-text-placeholder [&::-webkit-search-cancel-button]:appearance-none"
      />
    </div>
  )
}
