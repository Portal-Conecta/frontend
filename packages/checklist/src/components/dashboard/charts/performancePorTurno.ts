import type { StatsEntry } from "../../../types/dashboard";
import { humanizeStatsLabel } from "./statsLabels";

export type ComplianceBucket = "ok" | "atencao" | "critico";

/**
 * Agrupa entradas `SHIFT|bucket` (contagem) por turno e converte cada
 * turno para percentuais entre os 3 buckets (ok/atencao/critico).
 */
export function parsePerformancePorTurno(data: StatsEntry[]): {
  labels: string[];
  series: Record<ComplianceBucket, number[]>;
} {
  const byShift = new Map<string, Record<ComplianceBucket, number>>();

  for (const entry of data) {
    const [shift, bucket] = entry.label.split("|");
    if (!shift || !bucket) continue;
    if (bucket !== "ok" && bucket !== "atencao" && bucket !== "critico") continue;

    const current = byShift.get(shift) ?? { ok: 0, atencao: 0, critico: 0 };
    current[bucket] += entry.value;
    byShift.set(shift, current);
  }

  const shifts = [...byShift.keys()].sort();
  const labels = shifts.map((shift) => humanizeStatsLabel(shift));
  const series: Record<ComplianceBucket, number[]> = {
    ok: [],
    atencao: [],
    critico: [],
  };

  for (const shift of shifts) {
    const counts = byShift.get(shift)!;
    const total = counts.ok + counts.atencao + counts.critico;
    for (const bucket of ["ok", "atencao", "critico"] as const) {
      series[bucket].push(
        total > 0 ? Math.round((counts[bucket] / total) * 1000) / 10 : 0,
      );
    }
  }

  return { labels, series };
}
