"use client";

import { useState } from "react";

import { Text } from "@portal/ui";

import { findActiveTemplateByRoomClient } from "../../../services/client/templateClient";
import type { ClassSelection } from "../../../services/resolveClassSelection";
import type { ChecklistTemplateResponse } from "../../../types/template";
import { FillChecklistPage } from "../FillChecklistPage";
import { SelectRoomPage } from "../SelectRoomPage";

export interface ChecklistFlowProps {
  selection: ClassSelection;
  /** Nome da turma quando a seleção é `fixed` (turma única já resolvida). */
  fixedClassName?: string;
  filledByLabel: string;
}

interface FillTarget {
  template: ChecklistTemplateResponse;
  roomLabel: string;
}

export function ChecklistFlow({ selection, fixedClassName, filledByLabel }: ChecklistFlowProps) {
  const [target, setTarget] = useState<FillTarget | null>(null);
  const [error, setError] = useState("");

  if (selection.mode === "none") {
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          Você não tem turma vinculada para preencher checklist.
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          {error}
        </Text>
      </div>
    );
  }

  // Passo 1 — sala (universal, independente de turma).
  if (!target) {
    return (
      <SelectRoomPage
        onRoomSelected={async ({ roomId, roomLabel }) => {
          try {
            const template = await findActiveTemplateByRoomClient(roomId);
            if (!template) {
              setError("Nenhum checklist configurado para esta sala.");
              return;
            }
            setTarget({ template, roomLabel });
          } catch {
            setError("Não foi possível carregar o template desta sala. Tente novamente.");
          }
        }}
      />
    );
  }

  // Passo 2 — preenchimento: escolhe a turma no topo e preenche.
  return (
    <FillChecklistPage
      template={target.template}
      roomLabel={target.roomLabel}
      selection={selection}
      {...(fixedClassName !== undefined ? { fixedClassName } : {})}
      filledByLabel={filledByLabel}
    />
  );
}
