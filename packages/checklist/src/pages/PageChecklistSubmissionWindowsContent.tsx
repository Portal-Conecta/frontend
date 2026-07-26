"use client";

import { useEffect, useState } from "react";

import { messageFor } from "@portal/core/http/errorPresentation";
import { HttpError } from "@portal/core/http/errors";
import {
  Banner,
  Button,
  DefaultModal,
  Field,
  Select,
  Tag,
  Text,
  TimeInput,
  type SelectOption,
} from "@portal/ui";

import { SectionTabs, type SectionTab } from "../components/SectionTabs";
import { SuccessModal } from "../components/SuccessModal";
import {
  listSubmissionWindowsByClassClient,
  upsertSubmissionWindowClient,
} from "../services/client/submissionWindowClient";
import type {
  ChecklistType,
  SubmissionWindowResponse,
} from "../types/submissionWindow";

const CHECKLIST_TYPE_OPTIONS: SelectOption[] = [
  { value: "ARRIVAL", label: "Checklist de entrada" },
  { value: "POST_BREAK", label: "Checklist pós-intervalo" },
];

export interface PageChecklistSubmissionWindowsContentProps {
  sectionTabs: readonly SectionTab[];
  classOptions: SelectOption[];
}

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function fromMinutes(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Preview local (sem chamar o backend) de "aberta agora?" a partir dos valores do formulário. */
function computeWindowStatus(
  openAt: string,
  durationMinutes: number,
  now: Date,
): { open: boolean; label: string } | null {
  if (!openAt || !durationMinutes) return null;

  const start = toMinutes(openAt);
  const end = start + durationMinutes;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const open = nowMinutes >= start && nowMinutes < end;

  return {
    open,
    label: open
      ? `Aberta agora — fecha às ${fromMinutes(end)}`
      : nowMinutes < start
        ? `Fechada — abre às ${openAt}`
        : `Fechada — reabre amanhã às ${openAt}`,
  };
}

export function PageChecklistSubmissionWindowsContent({
  sectionTabs,
  classOptions,
}: PageChecklistSubmissionWindowsContentProps) {
  const [classId, setClassId] = useState<string | null>(null);
  const [windows, setWindows] = useState<SubmissionWindowResponse[]>([]);
  const [loadingWindows, setLoadingWindows] = useState(false);

  const [checklistType, setChecklistType] = useState<ChecklistType | null>(
    null,
  );
  const [openAt, setOpenAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{
    title: string;
    body: string;
  } | null>(null);

  // Turma trocou: recarrega as janelas dela e zera o formulário — os valores
  // do formulário anterior não têm relação com a turma nova.
  useEffect(() => {
    setChecklistType(null);
    setOpenAt("");
    setDurationMinutes("");
    setWindows([]);

    if (!classId) return;

    let cancelled = false;
    setLoadingWindows(true);
    listSubmissionWindowsByClassClient(classId)
      .then((data) => {
        if (!cancelled) setWindows(data);
      })
      .catch(() => {
        if (!cancelled) setWindows([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingWindows(false);
      });

    return () => {
      cancelled = true;
    };
  }, [classId]);

  // Tipo trocou: se já existe janela configurada pra esse tipo, o formulário
  // vira edição dela (preenche com o valor real); senão, começa em branco.
  useEffect(() => {
    if (!checklistType) return;
    const existing = windows.find((w) => w.checklistType === checklistType);
    setOpenAt(existing?.openAt ?? "");
    setDurationMinutes(
      existing ? String(existing.durationMinutes) : "",
    );
  }, [checklistType, windows]);

  const durationValue = Number(durationMinutes);
  const hasValidDuration =
    durationMinutes !== "" && durationValue >= 1 && durationValue <= 1439;
  const crossesMidnight =
    hasValidDuration && openAt
      ? toMinutes(openAt) + durationValue > 1439
      : false;

  const canSave =
    classId !== null &&
    checklistType !== null &&
    openAt !== "" &&
    hasValidDuration &&
    !crossesMidnight &&
    !saving;

  async function handleSave() {
    if (!canSave || !classId || !checklistType) return;

    setSaving(true);
    try {
      const saved = await upsertSubmissionWindowClient(classId, checklistType, {
        openAt,
        durationMinutes: durationValue,
      });
      setWindows((prev) => [
        ...prev.filter((w) => w.checklistType !== checklistType),
        saved,
      ]);
      setSuccessMessage("Janela de envio salva com sucesso!");
    } catch (err) {
      setErrorModal({
        title: "Não foi possível salvar a janela",
        body:
          err instanceof HttpError
            ? messageFor(err.kind)
            : "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {sectionTabs.length > 0 ? <SectionTabs tabs={[...sectionTabs]} /> : null}

      <Text as="h1" variant="heading-h2" tone="brand">
        Janelas de envio
      </Text>

      <div className="flex flex-col gap-4 md:max-w-md">
        <Field label="Turma">
          <Select
            options={classOptions}
            value={classId}
            onChange={setClassId}
            placeholder="Selecione a turma"
            aria-label="Turma"
          />
        </Field>
      </div>

      {classId && (
        <div className="flex flex-col gap-8 border-t border-border-default pt-6 lg:flex-row">
          {/* Parte 1: janelas já configuradas — dentro de um card (border + radius).
          Sem items-start no pai: as duas colunas esticam pra mesma altura
          (stretch é o default do flex), alinhando com os labels/botão da
          Parte 2 sem precisar de altura fixa nem scroll. */}
          <div className="flex flex-col gap-4 rounded-md border-sm border-border-default px-4 pt-4 lg:flex-[2]">
            <Text variant="heading-h3" tone="brand">
              Janelas Configuradas
            </Text>
            <div>
              {loadingWindows ? (
                <Text variant="body-sm" tone="secondary">
                  Carregando...
                </Text>
              ) : windows.length === 0 ? (
                <Text variant="body-sm" tone="secondary">
                  Nenhuma janela configurada pra essa turma ainda.
                </Text>
              ) : (
                // Mesmo modelo de tabela do Monitor de Envios (ChecklistSubmissionCard):
                // role="table"/"row", linhas com borda superior (sem card por linha,
                // já está dentro do card da seção).
                <div role="table" aria-label="Janelas configuradas">
                  <div
                    className="hidden border-t border-border-default p-3 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-x-6"
                    role="row"
                  >
                    <Text
                      variant="label-md-emphasis"
                      tone="brand"
                      className="min-w-0 truncate text-left"
                    >
                      Tipo de checklist
                    </Text>
                    <Text
                      variant="label-md-emphasis"
                      tone="brand"
                      className="min-w-0 truncate text-left"
                    >
                      Horário
                    </Text>
                    <Text
                      variant="label-md-emphasis"
                      tone="brand"
                      className="min-w-0 truncate text-left"
                    >
                      Status
                    </Text>
                  </div>

                  {windows.map((w) => {
                    const closesAt = fromMinutes(
                      toMinutes(w.openAt) + w.durationMinutes,
                    );
                    const rowStatus = computeWindowStatus(
                      w.openAt,
                      w.durationMinutes,
                      new Date(),
                    );
                    return (
                      <div
                        key={w.id}
                        className="flex flex-col gap-2 border-t border-border-default p-3 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-x-6"
                        role="row"
                      >
                        <Text variant="label-sm" tone="brand" className="lg:truncate">
                          {w.checklistType === "ARRIVAL"
                            ? "Checklist de entrada"
                            : "Checklist pós-intervalo"}
                        </Text>
                        <Text variant="body-sm" tone="secondary" className="lg:truncate">
                          {w.openAt} às {closesAt}
                        </Text>
                        {rowStatus && (
                          <Tag
                            tone={rowStatus.open ? "positive" : "neutral"}
                            icon={rowStatus.open ? "circle-check" : "clock"}
                            size="sm"
                            radius="full"
                            className="self-start"
                          >
                            {rowStatus.open ? "Aberta agora" : "Fechada agora"}
                          </Tag>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Parte 2: formulário de criação/edição — sem card, solto na coluna. */}
          <div className="flex flex-col gap-4 lg:flex-1">
            <Text variant="heading-h3" tone="brand">
              Definir Janela
            </Text>

            <Field label="Tipo de checklist">
              <Select
                options={CHECKLIST_TYPE_OPTIONS}
                value={checklistType}
                onChange={(value) => setChecklistType(value as ChecklistType)}
                placeholder="Selecione o tipo"
                aria-label="Tipo de checklist"
                className="max-w-xs"
              />
            </Field>

            {checklistType && (
              <>
                <div className="flex flex-wrap items-end gap-3">
                  <Field label="Abertura">
                    <TimeInput value={openAt} onChange={setOpenAt} />
                  </Field>

                  <Field label="Duração">
                    <input
                      type="number"
                      min={1}
                      max={1439}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      placeholder="Ex.: 20 minutos"
                      className="h-11 w-32 rounded-md border-sm border-border-default bg-background-surface px-3 text-text-primary placeholder:text-text-placeholder focus:border-border-focus focus:outline-none"
                    />
                  </Field>

                  <Button
                    variant="solid"
                    tone="brand"
                    iconLeft="check-check"
                    onClick={() => void handleSave()}
                    disabled={!canSave}
                    loading={saving}
                    className="h-11"
                  >
                    Salvar janela
                  </Button>
                </div>

                {crossesMidnight && (
                  <Banner variant="error">
                    A janela não pode ultrapassar a meia-noite — reduza a
                    duração ou o horário de abertura.
                  </Banner>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <SuccessModal
        open={successMessage !== null}
        message={successMessage ?? ""}
        onClose={() => setSuccessMessage(null)}
      />

      <DefaultModal
        isOpen={errorModal !== null}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title ?? ""}
        body={errorModal?.body ?? ""}
      />
    </div>
  );
}
