"use client";

import {
  getClassDetailClient,
  listClassesClient,
} from "@portal/core/classes/classesClient";
import { useEffect, useState } from "react";

import type { ClassSelection } from "../services/resolveClassSelection";

export interface SelectableClass {
  id: string;
  number: number;
  name: string;
}

/**
 * Carrega as turmas que o usuário pode escolher pra preencher o checklist:
 * - `admin`: todas as turmas (lista geral do Hub).
 * - `teacher`: só as turmas do professor (detalhe de cada uma pelo id do token).
 */
export function useSelectableClasses(selection: ClassSelection) {
  const [classes, setClasses] = useState<SelectableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const key =
    selection.mode === "teacher"
      ? selection.classIds.join(",")
      : selection.mode;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        let result: SelectableClass[] = [];

        if (selection.mode === "admin") {
          const { classes: all } = await listClassesClient();
          result = all.map((c) => ({
            id: c.id,
            number: c.number,
            name: c.name,
          }));
        } else if (selection.mode === "teacher") {
          const details = await Promise.all(
            selection.classIds.map((id) => getClassDetailClient(id)),
          );
          result = details.map((c) => ({
            id: c.id,
            number: c.number,
            name: c.name,
          }));
        }

        if (!cancelled) setClasses(result);
      } catch {
        if (!cancelled) setError("Não foi possível carregar as turmas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { classes, loading, error };
}
