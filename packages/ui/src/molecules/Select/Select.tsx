'use client'

/**
 * Select — combobox EDITÁVEL com dropdown próprio (input + lista).
 *
 * Este arquivo é o **controle**: um `<input>` com a caixa visual do átomo
 * `Input` onde o usuário digita para **filtrar** as opções, estado aberto/fechado,
 * teclado APG (setas, Enter, Esc, Tab), click-outside e foco gerido por
 * `aria-activedescendant`. O painel de opções é o componente irmão `SelectList`
 * (presentacional), que recebe a lista **já filtrada** e é reusado por SelectAsync.
 *
 * O texto digitado é **apenas filtro**: o `onChange` devolve o `value` de uma
 * opção válida (`string | null`) — não há entrada de texto livre. Ao fechar sem
 * escolher (Esc/Tab/click-outside), o campo volta a mostrar o item selecionado.
 *
 * Sem label visível (placeholder-only, como o `Input`): use `aria-label` ou um
 * Field. A borda focada usa `border-border-focus` (#01258f) — token do input
 * focado no Figma.
 */
import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'

import { Icon } from '../../atoms/Icon'
import { SelectList } from './SelectList'
import { sizeStyles, type SelectOption, type SelectSize } from './types'

export type { SelectOption, SelectSize } from './types'

export interface SelectProps {
  options: SelectOption[]
  /** Valor selecionado (controlado). `null`/`undefined` = nada selecionado. */
  value?: string | null
  /** Obrigatório: o Select é controlado (como o `Checkbox`), sem onChange ele ficaria travado. */
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  /** Mensagem de erro de validação. Presença ativa o estado de erro (barra + mensagem). */
  error?: string
  /** Mostra um `x` à direita (antes do chevron) para limpar a seleção. */
  clearable?: boolean
  size?: SelectSize
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Só para layout externo. */
  className?: string
  // --- estado assíncrono (preenchido pelo SelectAsync) ---
  loading?: boolean | undefined
  /** Texto do estado "sem opções" (filtro sem match, lista vazia ou falha de carregamento). */
  emptyMessage?: string | undefined
  /** Avisa abertura/fechamento (o SelectAsync usa para carregar ao abrir). */
  onOpenChange?: (open: boolean) => void
}

/** Próximo índice habilitado a partir de `from` (exclusivo) na direção `dir`. */
function nextEnabled(options: SelectOption[], from: number, dir: 1 | -1): number {
  const n = options.length
  if (n === 0) return -1
  for (let step = 1; step <= n; step++) {
    const i = (((from + dir * step) % n) + n) % n
    if (!options[i]?.disabled) return i
  }
  return from
}

function firstEnabled(options: SelectOption[]): number {
  return options.findIndex((o) => !o.disabled)
}

function lastEnabled(options: SelectOption[]): number {
  for (let i = options.length - 1; i >= 0; i--) if (!options[i]?.disabled) return i
  return -1
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Selecione',
  disabled = false,
  error,
  clearable = false,
  size = 'md',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  className,
  loading,
  emptyMessage,
  onOpenChange,
}: SelectProps) {
  const generatedId = useId()
  const baseId = id ?? generatedId
  const listId = `${baseId}-listbox`
  const errorId = `${baseId}-error`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const [open, setOpen] = useState(false)
  const [entered, setEntered] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // Texto do input. `typed` indica se o usuário editou desde a última abertura:
  // ao abrir sem digitar, mostramos todas as opções; só filtramos depois de digitar.
  const [query, setQuery] = useState('')
  const [typed, setTyped] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selectedOption = selectedIndex === -1 ? undefined : options[selectedIndex]
  const selectedLabel = selectedOption?.label ?? ''

  function filterOptions(q: string): SelectOption[] {
    const needle = q.trim().toLowerCase()
    if (!needle) return options
    return options.filter((o) => o.label.toLowerCase().includes(needle))
  }
  const filtered = typed ? filterOptions(query) : options

  function openMenu(toIndex?: number) {
    if (disabled || open) return
    setOpen(true)
    setTyped(false) // reabre mostrando todas as opções
    setActiveIndex(toIndex ?? (selectedIndex === -1 ? firstEnabled(options) : selectedIndex))
    onOpenChange?.(true)
  }

  // Fecha o menu e acerta o texto do input na hora (sem flash): `text` é o label
  // da opção escolhida (selectOption) ou, por padrão, o do item já selecionado —
  // assim Esc/Tab/click-outside revertem o filtro digitado.
  function closeMenu({ text = selectedLabel, refocus = true }: { text?: string; refocus?: boolean } = {}) {
    setOpen(false)
    setActiveIndex(-1)
    setTyped(false)
    setQuery(text)
    onOpenChange?.(false)
    if (refocus) inputRef.current?.focus()
  }

  function selectOption(index: number) {
    const option = filtered[index]
    if (!option || option.disabled) return
    onChange(option.value)
    closeMenu({ text: option.label })
  }

  // Rede de segurança: mantém o texto em sincronia com a seleção quando fechado.
  // As ações de fechar já acertam o texto; este efeito cobre o mount e mudanças
  // externas/assíncronas (ex.: o label do SelectAsync, que resolve após carregar).
  useEffect(() => {
    if (!open) setQuery(selectedLabel)
  }, [open, selectedLabel])

  // Anima a entrada (fade + slide) no frame seguinte ao montar a lista.
  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) closeMenu({ refocus: false })
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Mantém a opção ativa visível.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    setQuery(next)
    setTyped(true)
    if (!open) {
      setOpen(true)
      onOpenChange?.(true)
    }
    setActiveIndex(firstEnabled(filterOptions(next)))
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openMenu()
        else setActiveIndex((i) => nextEnabled(filtered, i, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openMenu(lastEnabled(options))
        else setActiveIndex((i) => nextEnabled(filtered, i, -1))
        break
      case 'Enter':
        if (open) {
          event.preventDefault()
          selectOption(activeIndex)
        }
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          closeMenu()
        }
        break
      case 'Tab':
        if (open) closeMenu({ refocus: false })
        break
      // Home/End não são sequestrados: movem o cursor de texto.
    }
  }

  const boxClasses = [
    'flex w-full items-center gap-2 rounded-md border-sm transition-colors font-inter',
    'focus-within:ring-2 focus-within:ring-border-focus',
    sizeStyles[size].trigger,
    disabled
      ? 'bg-background-default border-border-disabled'
      : 'bg-background-surface ' +
        (open ? 'border-border-focus' : error ? 'border-border-error' : 'border-border-default'),
  ].join(' ')

  const inputClasses = [
    'min-w-0 flex-1 border-0 bg-transparent p-0 outline-none appearance-none',
    disabled
      ? 'cursor-not-allowed text-text-disabled placeholder:text-text-disabled'
      : 'text-text-primary placeholder:text-text-placeholder',
  ].join(' ')

  // `x` de limpar só aparece com valor selecionado e habilitado.
  const showClear = clearable && !!selectedOption && !disabled

  return (
    <div ref={containerRef} className={className ? `relative w-full ${className}` : 'relative w-full'}>
      <div className={boxClasses}>
        <input
          ref={inputRef}
          id={baseId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && activeIndex >= 0 && filtered[activeIndex] ? optionId(activeIndex) : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          disabled={disabled}
          value={query}
          onChange={onInputChange}
          onFocus={() => inputRef.current?.select()}
          onClick={() => openMenu()}
          onKeyDown={onKeyDown}
          className={inputClasses}
        />

        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Limpar seleção"
            onClick={() => {
              onChange(null)
              setQuery('')
              setTyped(false)
              inputRef.current?.focus()
            }}
            className="shrink-0 cursor-pointer rounded text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Icon name="x" size={sizeStyles[size].icon} decorative />
          </button>
        ) : null}

        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Ocultar opções' : 'Mostrar opções'}
          disabled={disabled}
          onClick={() => {
            if (open) closeMenu()
            else {
              inputRef.current?.focus()
              openMenu()
            }
          }}
          className={`shrink-0 ${disabled ? 'cursor-not-allowed text-text-disabled' : 'cursor-pointer text-text-secondary'}`}
        >
          <Icon
            name="chevron-down"
            size={sizeStyles[size].icon}
            decorative
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open ? (
        <SelectList
          ref={listRef}
          options={filtered}
          value={value}
          activeIndex={activeIndex}
          size={size}
          listId={listId}
          optionId={optionId}
          entered={entered}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          onSelect={selectOption}
          onActivate={setActiveIndex}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      ) : null}

      {/* Estado de erro de validação espelha o do átomo Input (mesma barra + role=alert). */}
      {error ? (
        <div id={errorId} role="alert" className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
          <span className="text-label-xs font-inter text-feedback-error">{error}</span>
        </div>
      ) : null}
    </div>
  )
}
