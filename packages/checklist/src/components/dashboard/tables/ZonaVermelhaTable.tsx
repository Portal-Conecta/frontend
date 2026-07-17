"use client";

import { Button, Tag, Text } from "@portal/ui";

import {
  ZONA_VERMELHA,
  type ZonaVermelhaIssue,
} from "../data/dashboardDemoData";

const prioridadeTone: Record<
  ZonaVermelhaIssue["prioridade"],
  "negative" | "warning" | "neutral"
> = {
  HIGH: "negative",
  MEDIUM: "warning",
  LOW: "neutral",
};

const prioridadeLabel: Record<ZonaVermelhaIssue["prioridade"], string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

export interface ZonaVermelhaTableProps {
  onCorrigir?: (issueId: string) => void;
}

export function ZonaVermelhaTable({ onCorrigir }: ZonaVermelhaTableProps) {
  return (
    <section
      className="flex flex-col gap-4 rounded-md border border-border-default bg-background-surface p-5 shadow-sm"
      aria-labelledby="zona-vermelha-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text
            as="h2"
            id="zona-vermelha-title"
            variant="label-md-emphasis"
            tone="primary"
          >
            Zona Vermelha
          </Text>
          <Text variant="body-sm" tone="secondary" className="mt-1">
            Issues críticos que exigem ação imediata
          </Text>
        </div>
        <Tag tone="negative" size="sm" radius="full" icon="triangle-alert">
          {ZONA_VERMELHA.length} abertos
        </Tag>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default">
              {[
                "Sala",
                "Item",
                "Categoria",
                "Prioridade",
                "Turno",
                "Aberto há",
                "",
              ].map((h) => (
                <th key={h || "acao"} className="px-3 py-3">
                  <Text as="span" variant="label-xs" tone="secondary">
                    {h}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ZONA_VERMELHA.map((issue) => (
              <tr
                key={issue.id}
                className="border-b border-border-default last:border-b-0 hover:bg-background-default/80"
              >
                <td className="px-3 py-3">
                  <Text variant="body-sm" tone="primary">
                    {issue.sala}
                  </Text>
                </td>
                <td className="px-3 py-3">
                  <Text variant="body-sm" tone="primary">
                    {issue.item}
                  </Text>
                </td>
                <td className="px-3 py-3">
                  <Text variant="body-sm" tone="secondary">
                    {issue.categoria}
                  </Text>
                </td>
                <td className="px-3 py-3">
                  <Tag
                    tone={prioridadeTone[issue.prioridade]}
                    size="sm"
                    radius="full"
                  >
                    {prioridadeLabel[issue.prioridade]}
                  </Tag>
                </td>
                <td className="px-3 py-3">
                  <Text variant="body-sm" tone="secondary">
                    {issue.turno}
                  </Text>
                </td>
                <td className="px-3 py-3">
                  <Text variant="body-sm" tone="secondary">
                    {issue.abertoHa}
                  </Text>
                </td>
                <td className="px-3 py-3 text-right">
                  <Button
                    variant="solid"
                    tone="brand"
                    size="sm"
                    onClick={() => onCorrigir?.(issue.id)}
                  >
                    Corrigir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
