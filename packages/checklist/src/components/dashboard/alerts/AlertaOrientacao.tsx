"use client";

import { Icon, Text } from "@portal/ui";

import { ALERTAS_ORIENTACAO } from "../data/dashboardDemoData";

export function AlertaOrientacao() {
  return (
    <section
      className="flex flex-col gap-4 rounded-md border border-border-default bg-background-surface p-4 shadow-sm"
      aria-labelledby="alerta-orientacao-title"
    >
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-interactive-subtle text-text-brand">
          <Icon name="circle-alert" size="md" />
        </span>
        <div>
          <Text
            as="h2"
            id="alerta-orientacao-title"
            variant="label-md-emphasis"
            tone="primary"
          >
            Alerta de Orientação
          </Text>
          <Text variant="body-sm" tone="secondary" className="mt-1">
            Recomendações operacionais com base nos checklists recentes
          </Text>
        </div>
      </header>

      <ul className="flex flex-col gap-3">
        {ALERTAS_ORIENTACAO.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-sm border border-border-default bg-background-default px-4 py-3"
          >
            <span className="mt-0.5 text-text-brand" aria-hidden>
              <Icon name="circle-check" size="sm" />
            </span>
            <div className="flex flex-col gap-1">
              <Text variant="label-sm-emphasis" tone="primary">
                {item.title}
              </Text>
              <Text variant="body-sm" tone="secondary">
                {item.description}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
