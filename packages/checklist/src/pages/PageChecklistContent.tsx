"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorPage } from "@portal/ui/molecules";
import { Skeleton, Button, Icon, Text } from "@portal/ui/atoms";
import { ChecklistForm } from "../components/ChecklistForm";
import { ChecklistSuccessSummary } from "../components/ChecklistSuccessSummary";
import { createDraftClient, ExecutionClientError } from "../services/client/executionClient";
import { getClassSubmissionWindowsClient } from "../services/client/submissionWindowClient";
import type { ChecklistExecutionResponse, ChecklistType } from "../types/execution";
import type { ChecklistSchema } from "../types/template";

function isInsideAnyWindow(windows: { openAt: string; durationMinutes: number }[]): boolean {
  if (windows.length === 0) return true;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const w of windows) {
    const parts = w.openAt.split(":");
    if (parts.length >= 2) {
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + w.durationMinutes;

      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return true;
      }
    }
  }

  return false;
}

export function PageChecklistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const templateId = searchParams.get("templateId");
  const roomId = searchParams.get("roomId");
  const classId = searchParams.get("classId");
  const checklistType = searchParams.get("checklistType") as ChecklistType | null;

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ChecklistExecutionResponse | null>(null);
  const [schema, setSchema] = useState<ChecklistSchema | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string>("500");
  const [outOfWindowMsg, setOutOfWindowMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      if (!templateId || !roomId || !classId || !checklistType) {
        setErrorMsg("Parâmetros incompletos na URL. Volte e selecione uma turma novamente.");
        setErrorCode("400");
        setLoading(false);
        return;
      }

      try {
        const windows = await getClassSubmissionWindowsClient(classId);
        const relevantWindows = windows.filter((w) => w.checklistType === checklistType);
        
        if (relevantWindows.length > 0 && !isInsideAnyWindow(relevantWindows)) {
          const w = relevantWindows[0];
          setOutOfWindowMsg(`Fora da janela de envio. Janela permitida: ${w?.openAt} com duração de ${w?.durationMinutes} minutos.`);
        }

        const execution = await createDraftClient({
          templateId,
          roomId,
          classId,
          checklistType,
        });

        const resTemplate = await fetch(`/api/checklist/templates/${templateId}`);
        if (!resTemplate.ok) throw new Error("Template não encontrado");
        const templateData = await resTemplate.json();

        setDraft(execution);
        setSchema(templateData.schemaJson);

      } catch (err) {
        if (err instanceof ExecutionClientError) {
          if (err.status === 401) {
            router.push("/login");
            return;
          }
          if (err.status === 409) {
            setErrorMsg("Esse checklist já foi preenchido ou está em uso. Por favor, recarregue os dados.");
            setErrorCode("409");
          } else if (err.status === 422) {
            setOutOfWindowMsg(err.message || "Fora da janela de submissão permitida.");
          } else {
            setErrorMsg(err.message || "Não foi possível carregar o checklist.");
            setErrorCode(String(err.status));
          }
        } else {
          setErrorMsg("Erro interno ao carregar o checklist.");
          setErrorCode("500");
        }
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [templateId, roomId, classId, checklistType, router]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6 h-[70vh]">
        <ErrorPage
          code={errorCode}
          title="Não foi possível abrir o checklist"
          description={errorMsg}
        />
        <div className="flex justify-center mt-4">
          <Button variant="solid" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  if (outOfWindowMsg) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center text-center p-6">
        <Icon name="clock" size="lg" className="text-interactive-subtle mb-4" decorative />
        <Text as="h2" variant="label-md-emphasis" tone="brand">
          Fora do Horário
        </Text>
        <Text as="p" variant="body-sm" tone="secondary" className="mt-1 max-w-md mb-4">
          {outOfWindowMsg}
        </Text>
        <Button variant="outlined" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  if (isSuccess && draft) {
    return (
      <div className="p-6">
        <ChecklistSuccessSummary
          execution={draft}
          onFinish={() => router.push("/")}
        />
      </div>
    );
  }

  if (!draft || !schema) {
    return (
      <div className="p-6 h-[70vh]">
        <ErrorPage
          code="500"
          title="Erro de Carregamento"
          description="Os dados do rascunho ou do template não foram carregados corretamente."
        />
        <div className="flex justify-center mt-4">
          <Button variant="solid" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ChecklistForm
        draft={draft}
        schema={schema}
        onSuccess={(updatedExecution) => {
          setDraft(updatedExecution);
          setIsSuccess(true);
        }}
        onCancelSuccess={() => {
          router.back();
        }}
      />
    </div>
  );
}
