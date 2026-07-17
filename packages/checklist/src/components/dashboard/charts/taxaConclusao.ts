import type { StatsEntry } from "../../../types/dashboard";

/** Interpretação do array `taxaConclusao` do dashboard backend. */
export interface TaxaConclusaoParsed {
  submitted: number;
  total: number;
  /** Percentual 0–100 (não fração 0–1). */
  ratePercent: number;
}

export function findStatsValue(
  entries: StatsEntry[],
  predicates: string[],
): number {
  const upper = predicates.map((p) => p.toUpperCase());
  const hit = entries.find((e) => {
    const label = e.label.toUpperCase().replace(/[_\s-]/g, "");
    return upper.some((p) => label.includes(p.replace(/[_\s-]/g, "")));
  });
  return hit?.value ?? 0;
}

/**
 * Backend envia:
 *   [{ label: "submitted", value }, { label: "total", value }, { label: "ratePercent", value }]
 *
 * Se `ratePercent` ausente, calcula submitted/total * 100.
 */
export function parseTaxaConclusao(
  entries: StatsEntry[] | undefined | null,
): TaxaConclusaoParsed {
  const list = entries ?? [];
  const submitted = findStatsValue(list, ["SUBMITTED", "SUBMIT"]);
  const total = findStatsValue(list, ["TOTAL"]);
  let ratePercent = findStatsValue(list, ["RATEPERCENT", "RATE"]);

  if (ratePercent <= 0 && total > 0) {
    ratePercent = (submitted / total) * 100;
  }

  // fallback legado (Concluídas / Pendentes sem total/rate)
  if (
    total <= 0 &&
    list.length > 0 &&
    !list.some((e) => /rate|total|submit/i.test(e.label))
  ) {
    const sum = list.reduce((a, e) => a + e.value, 0);
    const first = list[0]?.value ?? 0;
    return {
      submitted: first,
      total: sum,
      ratePercent: sum > 0 ? (first / sum) * 100 : 0,
    };
  }

  return { submitted, total, ratePercent };
}

/**
 * Donut: só contagens comparáveis (submetidas vs restante).
 * Nunca inclui `ratePercent` no mesmo gráfico.
 */
export function taxaConclusaoToChartEntries(
  entries: StatsEntry[] | undefined | null,
): StatsEntry[] {
  const { submitted, total } = parseTaxaConclusao(entries);
  if (total <= 0) return [];

  const pending = Math.max(0, total - submitted);
  return [
    { label: "Submetidas", value: submitted },
    { label: "Não submetidas", value: pending },
  ];
}
