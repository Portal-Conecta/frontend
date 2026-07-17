import { describe, expect, it } from "vitest";

import { isEmptyStats, statsToChartData } from "./statsToChartData";

describe("statsToChartData", () => {
  it("mantém cor por entidade ao reordenar por valor", () => {
    const a = statsToChartData([
      { label: "A", value: 1 },
      { label: "B", value: 10 },
    ]);
    const b = statsToChartData([
      { label: "B", value: 10 },
      { label: "A", value: 1 },
    ]);

    const colorA1 = a.colors[a.labels.indexOf("A")];
    const colorA2 = b.colors[b.labels.indexOf("A")];
    expect(colorA1).toBe(colorA2);
  });

  it("agrupa em Outros quando há mais de 8 categorias", () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({
      label: `C${i}`,
      value: 10 - i,
    }));
    const chart = statsToChartData(entries);
    expect(chart.labels).toHaveLength(8);
    expect(chart.labels[chart.labels.length - 1]).toBe("Outros");
  });

  it("isEmptyStats", () => {
    expect(isEmptyStats([])).toBe(true);
    expect(isEmptyStats([{ label: "x", value: 0 }])).toBe(true);
    expect(isEmptyStats([{ label: "x", value: 2 }])).toBe(false);
  });

  it("preserveOrder mantém ordem cronológica da série temporal", () => {
    const chart = statsToChartData(
      [
        { label: "01/06", value: 1 },
        { label: "02/06", value: 9 },
        { label: "03/06", value: 3 },
      ],
      { preserveOrder: true },
    );
    expect(chart.labels).toEqual(["01/06", "02/06", "03/06"]);
    expect(chart.values).toEqual([1, 9, 3]);
  });
});
