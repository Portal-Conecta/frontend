/**
 * Tipos e tamanhos da família SearchBar (SearchBar, SearchBarResults,
 * SearchBarAsync). Módulo à parte para o controle e a lista importarem sem ciclo.
 */
import type { IconName, IconSize } from "../../atoms/Icon";

export interface SearchBarItem {
  /** Identidade estável do resultado (key + payload de `onSelect`). */
  value: string;
  /** Texto primário do resultado (ex.: "Desenvolvimento de Sistema"). */
  label: string;
  /** Texto secundário/código à esquerda (ex.: "MIDS - 78"). */
  meta?: string;
  /** Ícone opcional à esquerda do resultado. */
  icon?: IconName;
  disabled?: boolean;
}

export type SearchBarSize = "sm" | "md" | "lg";

// Alturas/paddings espelham o Select (mesma escala de input). O item tem respiro
// maior que a opção do Select por ser mais rico (meta + label lado a lado).
export const sizeStyles: Record<
  SearchBarSize,
  { trigger: string; item: string; icon: IconSize }
> = {
  sm: {
    trigger: "h-9 px-3 text-label-sm",
    item: "gap-3 px-3 py-2 text-label-sm",
    icon: "sm",
  },
  md: {
    trigger: "h-11 px-3 text-label-md",
    item: "gap-3 px-3 py-3 text-label-md",
    icon: "sm",
  },
  lg: {
    trigger: "h-12 px-4 text-label-md",
    item: "gap-4 px-4 py-3.5 text-label-md",
    icon: "md",
  },
};
