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
