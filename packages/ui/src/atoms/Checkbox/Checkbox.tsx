'use client'

/**
 * Checkbox — átomo de seleção controlado (button + Icon + Text).
 * Hover e pressed são pseudo-classes CSS: funcionam ao importar o átomo, sem
 * wrapper. O estado marcado fixa a cor de brand. Icon e Text herdam a cor via
 * currentColor, então basta colorir o button.
 */
import { Text } from "../Text";
import { Icon } from "../Icon";

type CheckboxSize = "sm" | "md" | "lg";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: CheckboxSize;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  size = "md",
  disabled,
  id,
}: CheckboxProps) {
  // Marcado: cor de brand fixa. Desmarcado: secondary em repouso, com hover e
  // active (pressed) reais via pseudo-classe.
  // EXCEÇÃO de token: o hover usa o primitivo `blue-300` a pedido do produto —
  // fora da camada semântica (tokens-e-theming §4), pendente de aprovação do TL.
  const colorClass = checked
    ? "text-text-brand"
    : "text-text-secondary hover:text-interactive-hover active:text-interactive-pressed";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 transition-colors duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-70 ${colorClass}`}
    >
      <Icon name={checked ? "square-check" : "square"} size={size} />
      {label && <Text>{label}</Text>}
    </button>
  );
}
