import { colorPrimitives, colors } from "@portal/ui";

/**
 * Paleta categórica do DS — ordem fixa, nunca ciclada.
 *
 * Rampas de blue/gray do DS (sem feedback success/warning/error).
 * Validada por `pnpm validate:ds-palette` (ΔE ≥ 8, status fora da lista).
 *
 * 8+ categorias no consumidor → agrupar em "Outros".
 */
/**
 * Paleta categórica padrão (blue + gray).
 * Preferir {@link DS_CATEGORICAL_BLUE} em dashboards “brand”.
 */
export const DS_CATEGORICAL = [
  colorPrimitives.blue[500], // brand
  colorPrimitives.blue[300], // focus-ring / accent
  colorPrimitives.gray[600], // text secondary
  colorPrimitives.blue[700], // brand hover
  colorPrimitives.gray[400], // muted
  colorPrimitives.blue[900], // brand pressed
  colorPrimitives.gray[900], // text primary
  colorPrimitives.blue[100], // brand subtle (último slot / “Outros”)
] as const;

/**
 * Rampa azul enxuta do DS — dashboards e séries brand (poucas cores).
 * Ordem: brand → accent → subtle.
 */
export const DS_CATEGORICAL_BLUE = [
  colorPrimitives.blue[500], // #01258F
  colorPrimitives.blue[300], // #0035D4
  colorPrimitives.blue[100], // #D6E0F7
] as const;

export type DsCategoricalColor = (typeof DS_CATEGORICAL)[number];

/** Cores de status — só para estados, nunca para série ordinal. */
export const DS_STATUS_COLORS = {
  success: colors.feedback.success,
  warning: colors.feedback.warning,
  error: colors.feedback.error,
  info: colors.feedback.info,
} as const;

/**
 * Status em tom azul simples do DS (3 tons).
 */
export const DS_STATUS_COLORS_BLUE = {
  success: colorPrimitives.blue[500],
  warning: colorPrimitives.blue[300],
  error: colorPrimitives.blue[500],
  info: colorPrimitives.blue[100],
} as const;

/**
 * Cor estável por entidade (id/label), não por rank.
 * Filtrar uma série não repinta as demais.
 */
export function colorForEntity(
  entityKey: string,
  palette: readonly string[] = DS_CATEGORICAL,
): string {
  if (palette.length === 0) {
    return colors.text.brand;
  }
  let hash = 0;
  for (let i = 0; i < entityKey.length; i += 1) {
    hash = (hash * 31 + entityKey.charCodeAt(i)) >>> 0;
  }
  const index = hash % palette.length;
  const color = palette[index];
  // palette.length > 0 e index sempre no range
  return color ?? colors.text.brand;
}

/**
 * Atribui cores a séries em ordem de aparição, respeitando paleta fixa.
 */
export function assignSeriesColors(
  seriesKeys: readonly string[],
  palette: readonly string[] = DS_CATEGORICAL,
): Map<string, string> {
  const map = new Map<string, string>();
  if (palette.length === 0) {
    return map;
  }
  const fallback = palette[0] ?? colors.text.brand;
  const max = Math.min(seriesKeys.length, palette.length);
  for (let i = 0; i < max; i += 1) {
    const key = seriesKeys[i];
    if (key === undefined) continue;
    map.set(key, palette[i] ?? fallback);
  }
  return map;
}

/** Máximo de séries distintas antes de agrupar em "Outros". */
export const DS_MAX_CATEGORIES = DS_CATEGORICAL.length;
