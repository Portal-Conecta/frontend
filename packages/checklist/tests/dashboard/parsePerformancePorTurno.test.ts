import { describe, expect, it } from "vitest";

import { parsePerformancePorTurno } from "../../src/components/dashboard/charts/performancePorTurno";

describe("parsePerformancePorTurno", () => {
  it("converte contagens SHIFT|bucket em percentuais por turno", () => {
    const result = parsePerformancePorTurno([
      { label: "FULL_AM_PM|ok", value: 8 },
      { label: "FULL_AM_PM|atencao", value: 1 },
      { label: "FULL_AM_PM|critico", value: 1 },
      { label: "FULL_PM_NT|ok", value: 5 },
    ]);

    expect(result.labels).toEqual(["Manhã/Tarde", "Tarde/Noite"]);
    expect(result.series.ok).toEqual([80, 100]);
    expect(result.series.atencao).toEqual([10, 0]);
    expect(result.series.critico).toEqual([10, 0]);
  });

  it("ignora entradas com label mal formado", () => {
    const result = parsePerformancePorTurno([
      { label: "sem-separador", value: 5 },
      { label: "FULL_AM_PM|desconhecido", value: 3 },
    ]);

    expect(result.labels).toEqual([]);
  });

  it("retorna vazio quando não há dados", () => {
    const result = parsePerformancePorTurno([]);

    expect(result.labels).toEqual([]);
    expect(result.series).toEqual({ ok: [], atencao: [], critico: [] });
  });
});
