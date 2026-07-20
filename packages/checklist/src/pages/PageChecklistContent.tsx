// packages/checklist/src/pages/PageChecklistContent.tsx (completo)
"use client";

import { useState, useTransition } from "react";

import { Text } from "@portal/ui";

import { ChecklistItem } from "../components/ChecklistItem/ChecklistItem";
import { RoomSelector, type Room } from "../components/RoomSelector/RoomSelector";
import type { StatusValue } from "../components/StatusToggle/StatusToggle";
import { findActiveTemplateByRoom } from "../services/client/templateClient";
import type { ChecklistTemplateResponse } from "../types/template";

export interface PageChecklistContentProps {
  rooms: Room[];
}

export function PageChecklistContent({ rooms }: PageChecklistContentProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [template, setTemplate] = useState<ChecklistTemplateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, StatusValue | null>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});

  function handleSelectRoom(room: Room) {
    setSelectedRoom(room);
    setTemplate(null);
    setError(null);
    startTransition(async () => {
      const found = await findActiveTemplateByRoom(room.id).catch(() => null);
      if (!found) {
        setError("Essa sala não tem um checklist ativo.");
        return;
      }
      setTemplate(found);
    });
  }

  if (!selectedRoom) {
    return <RoomSelector rooms={rooms} onSelect={handleSelectRoom} />;
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-6 px-3 py-16 md:px-8 md:py-24">
        <Text variant="body-md" tone="secondary">
          Carregando checklist...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 px-3 py-16 md:px-8 md:py-24">
        <Text variant="body-md" tone="secondary">
          {error}
        </Text>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-3 py-16 md:px-8 md:py-24">
      <Text as="h1" variant="heading-h2" tone="brand" className="text-center">
        {template.title}
      </Text>

      {template.schemaJson.sections.map((section) => (
        <div key={section.key} className="flex flex-col gap-2">
          <Text as="h2" variant="label-md-emphasis" tone="brand">
            {section.title}
          </Text>

          {section.items.map((item) => (
            <ChecklistItem
              key={item.key}
              title={item.title}
              description={item.description}
              value={answers[item.key] ?? null}
              onChange={(value) =>
                setAnswers((prev) => ({ ...prev, [item.key]: value }))
              }
              justification={justifications[item.key] ?? ""}
              onJustificationChange={(text) =>
                setJustifications((prev) => ({ ...prev, [item.key]: text }))
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}