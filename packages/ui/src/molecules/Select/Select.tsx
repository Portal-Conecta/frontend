'use client'

/**
 * Select — molecule de seleção com dropdown próprio (combobox + lista).
 *
 * Este arquivo é o **controle**: trigger com a caixa visual do átomo `Input`,
 * estado aberto/fechado, teclado APG (setas, Home/End, Enter/Espaço, Esc),
 * click-outside e foco gerido por `aria-activedescendant`. O painel de opções
 * é o componente irmão `SelectList` (presentacional), reusado por SelectAsync e
 * pelo multi-select nas próximas fases (ver issue #94).
 *
 * Sem label visível (placeholder-only, como o `Input`): use `aria-label` ou um
 * Field. A borda focada usa `border-border-focus` (#01258f) — confirmado
 * como o token do input focado no Figma; o blue/700 do Figma é o label e o rail
 * da lista (variante), não a borda do input.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

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
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem). */
  error?: string
  /** Mostra um `x` na borda esquerda para limpar a seleção. */
  clearable?: boolean
  size?: SelectSize
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Só para layout externo. */
  className?: string
}

/** Próximo índice habilitado a partir de `from` (exclusivo) na direção `dir`. */
function nextEnabled(options: SelectOption[], from: number, dir: 1 | -1): number {
  const n = options.length
  for (let step = 1; step <= n; step++) {
    const i = (((from + dir * step) % n) + n) % n
    if (!options[i]?.disabled) return i
  }
  return from
}

function firstEnabled(options: SelectOption[]): number {
  const i = options.findIndex((o) => !o.disabled)
  return i === -1 ? 0 : i
}

function lastEnabled(options: SelectOption[]): number {
  for (let i = options.length - 1; i >= 0; i--) if (!options[i]?.disabled) return i
  return options.length - 1
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
}: SelectProps) {
  const generatedId = useId()
  const baseId = id ?? generatedId
  const listId = `${baseId}-listbox`
  const errorId = `${baseId}-error`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const [open, setOpen] = useState(false)
  const [entered, setEntered] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selectedOption = selectedIndex === -1 ? undefined : options[selectedIndex]

  function openMenu(toIndex?: number) {
    if (disabled) return
    setOpen(true)
    setActiveIndex(toIndex ?? (selectedIndex === -1 ? firstEnabled(options) : selectedIndex))
  }

  function closeMenu(refocus = true) {
    setOpen(false)
    setActiveIndex(-1)
    if (refocus) triggerRef.current?.focus()
  }

  function selectOption(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    onChange(option.value)
    closeMenu()
  }

  // Anima a entrada (fade + slide) no frame seguinte ao montar a lista.
  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) closeMenu(false)
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

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openMenu(event.key === 'ArrowUp' ? lastEnabled(options) : undefined)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => nextEnabled(options, i, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => nextEnabled(options, i, -1))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(firstEnabled(options))
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(lastEnabled(options))
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectOption(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        closeMenu()
        break
      case 'Tab':
        closeMenu(false)
        break
      // TODO(fase seguinte): type-ahead por caractere.
    }
  }

  const triggerBox = [
    'flex w-full items-center gap-2 rounded-md border-sm transition-colors font-inter outline-none',
    'focus-visible:ring-2 focus-visible:ring-border-focus',
    sizeStyles[size].trigger,
    disabled
      ? 'cursor-not-allowed bg-background-default border-border-disabled text-text-disabled'
      : 'cursor-pointer bg-background-surface text-text-primary ' +
        (open ? 'border-border-focus' : error ? 'border-border-error' : 'border-border-default'),
  ].join(' ')

  // `x` de limpar só aparece com valor selecionado e habilitado.
  const showClear = clearable && !!selectedOption && !disabled

  return (
    <div ref={containerRef} className={className ? `relative w-full ${className}` : 'relative w-full'}>
      <div className="relative">
        {showClear ? (
          <button
            type="button"
            aria-label="Limpar seleção"
            onClick={() => {
              onChange(null)
              triggerRef.current?.focus()
            }}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Icon name="x" size={sizeStyles[size].icon} decorative />
          </button>
        ) : null}
        <button
          ref={triggerRef}
          type="button"
          id={baseId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={onKeyDown}
          className={triggerBox}
        >
          <span
            className={`min-w-0 flex-1 truncate text-left ${showClear ? 'pl-6' : ''} ${selectedOption ? '' : 'text-text-placeholder'}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <Icon
            name="chevron-down"
            size={sizeStyles[size].icon}
            decorative
            className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open ? (
        <SelectList
          ref={listRef}
          options={options}
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
        />
      ) : null}

      {/* Estado de erro espelha o do átomo Input (mesma barra + role=alert). */}
      {error ? (
        <div id={errorId} role="alert" className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
          <span className="text-label-xs font-inter text-feedback-error">{error}</span>
        </div>
      ) : null}
    </div>
  )
}
