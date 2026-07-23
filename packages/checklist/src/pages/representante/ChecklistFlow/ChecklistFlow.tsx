"use client";

import { useState, type ReactNode } from "react";

import { Button, EmptyState, Text } from "@portal/ui";

import { ChecklistErrorState } from "../../../components/ChecklistErrorState";
import type { SectionTab } from "../../../components/SectionTabs";
import { SectionTabs } from "../../../components/SectionTabs";
import { findActiveTemplateByRoomClient } from "../../../services/client/templateClient";
import type { ClassSelection } from "../../../services/resolveClassSelection";
import type { ChecklistTemplateResponse } from "../../../types/template";
import { FillChecklistPage } from "../FillChecklistPage";
import { FillChecklistSkeleton } from "../FillChecklistPage/FillChecklistSkeleton";
import { SelectRoomPage } from "../SelectRoomPage";

export interface ChecklistFlowProps {
  selection: ClassSelection;
  /** Nome da turma quando a seleção é fixed (turma única já resolvida). */
  fixedClassName?: string;

  /**
   * Gestão (SENAI/WEG/ADMIN): abas de navegação do módulo no topo, já
   * resolvidas por papel (resolveChecklistSectionTabs). Ausente/vazio para
   * representante/professor, que não precisam do componente.
   */
  sectionTabs?: readonly SectionTab[];
}

interface FillTarget {
  template: ChecklistTemplateResponse;
  roomLabel: string;
}

export function ChecklistFlow({
  selection,
  fixedClassName,

  sectionTabs,
}: ChecklistFlowProps) {
  const [target, setTarget] = useState<FillTarget | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [error, setError] = useState("");
  const [noTemplateRoom, setNoTemplateRoom] = useState(false);

  const tabs = sectionTabs?.length ? (
    <SectionTabs tabs={[...sectionTabs]} />
  ) : null;

  const resetToRoomSelection = () => {
    setError("");
    setNoTemplateRoom(false);
    setTarget(null);
  };

  const selectRoom = async ({
    roomId,
    roomLabel,
  }: {
    roomId: string;
    roomLabel: string;
  }) => {
    setLoadingTemplate(true);
    try {
      const template = await findActiveTemplateByRoomClient(roomId);
      if (!template) {
        setNoTemplateRoom(true);
        return;
      }
      setTarget({ template, roomLabel });
    } catch {
      setError(
        "Não foi possível carregar o template desta sala. Tente novamente.",
      );
    } finally {
      setLoadingTemplate(false);
    }
  };

  let content: ReactNode;

  if (selection.mode === "none") {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <Text variant="body-sm" tone="secondary">
          Você não tem turma vinculada para preencher checklist.
        </Text>
      </div>
    );
  } else if (loadingTemplate) {
    // Mesma estrutura da tela de preenchimento (header + turma + itens + footer).
    content = <FillChecklistSkeleton />;
  } else if (error) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <ChecklistErrorState
          description={error}
          onRetry={resetToRoomSelection}
        />
      </div>
    );
  } else if (noTemplateRoom) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="Sala sem checklist"
          description="Nenhum checklist configurado para esta sala."
          action={
            <Button variant="outlined" onClick={resetToRoomSelection}>
              Selecionar outra sala
            </Button>
          }
        />
      </div>
    );
  } else if (!target) {
    // Passo 1 — sala (universal, independente de turma).
    content = <SelectRoomPage onRoomSelected={selectRoom} />;
  } else {
    // Passo 2 — preenchimento: escolhe a turma no topo e preenche.
    content = (
      <FillChecklistPage
        template={target.template}
        roomLabel={target.roomLabel}
        selection={selection}
        {...(fixedClassName !== undefined ? { fixedClassName } : {})}
        onBack={() => setTarget(null)}
      />
    );
  }

  if (!tabs) return content;

  return (
    <div className="flex h-full flex-col">
      {/* O padding lateral (px-6 md:px-8) no container delimita a largura máxima da linha cinza */}
      <div className="px-6 pt-6 md:px-8 md:pt-8">{tabs}</div>
      <div className="flex flex-1 flex-col overflow-hidden">{content}</div>
    </div>
  );
}
