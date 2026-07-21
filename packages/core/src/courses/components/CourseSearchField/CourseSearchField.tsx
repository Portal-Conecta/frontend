'use client'

/**
 * CourseSearchField — busca da lista de cursos por nome ou código.
 *
 * Componente específico do domínio de cursos (nasce no core, issue #357). O
 * átomo `Input` do DS só expõe ícone à direita e o protótipo pede a lupa à
 * **esquerda** num campo full-width arredondado (`lg`), então compomos aqui o
 * `Icon` + input nativo reusando as mesmas classes de token do `Input` — sem
 * duplicar regra de cor nem tocar em `packages/ui` (mudança no DS exige squad).
 *
 * Controlado: recebe `value` e emite `onChange`. O debounce e a chamada ao BFF
 * vivem na página (`PageCursosContent`).
 */
import { Icon } from '@portal/ui'

export interface CourseSearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function CourseSearchField({
  value,
  onChange,
  placeholder = 'Buscar por nome ou código',
  className,
  id,
}: CourseSearchFieldProps) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg border-sm px-6 py-2.5 transition-colors',
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
        aria-label="Buscar cursos"
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
