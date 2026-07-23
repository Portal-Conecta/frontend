"use client";

import { useEffect, useState } from "react";

import { readDsChartTheme, type DsChartTheme } from "./dsChartTheme";

/**
 * Tema de gráfico reativo a light/dark (observa `class` em documentElement).
 */
export function useDsChartTheme(): DsChartTheme {
  const [theme, setTheme] = useState<DsChartTheme>(() => readDsChartTheme());

  useEffect(() => {
    const refresh = () => setTheme(readDsChartTheme());
    refresh();

    const root = document.documentElement;
    const observer = new MutationObserver(refresh);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", refresh);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", refresh);
    };
  }, []);

  return theme;
}
