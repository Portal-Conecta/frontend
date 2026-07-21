"use client";

import { useState } from "react";
import {
  Button,
  Text,
  Input,
  Select,
  type SelectOption,
  Icon,
} from "@portal/ui";
import { useRouter } from "next/navigation";
import type { SubmissionWindowRequest } from "../types/submissionWindow";

export function PageChecklistLanding() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Mock data for classes - TODO: replace with real API call from core/services
  const mockClasses = [
    { id: "1", code: "MAT101", name: "Matematica", series: "1ª Serie" },
    { id: "2", code: "POR101", name: "Português", series: "1ª Serie" },
    { id: "3", code: "HIS101", name: "Historia", series: "2ª Serie" },
  ];

  const classOptions: SelectOption[] = mockClasses.map((cls) => ({
    label: `${cls.code} - ${cls.name} (${cls.series})`,
    value: cls.id,
  }));

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedClassId(null);
    setStartTime("");
    setEndTime("");
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveConfig = async () => {
    if (!selectedClassId || !startTime || !endTime) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    // Validate that end time is after start time
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (end <= start) {
      setError("O horário de término deve ser posterior ao horário de início");
      return;
    }

    const durationMinutes = Math.round(
      (end.getTime() - start.getTime()) / 60000
    );

    setIsLoading(true);
    setError(null);
    try {
      const checklistType: "ARRIVAL" | "POST_BREAK" = "ARRIVAL";

      const requestBody: SubmissionWindowRequest = {
        openAt: startTime, // HH:mm
        durationMinutes: durationMinutes,
      };

      const url = `/api/checklist/submission-windows/classes/${selectedClassId}/${checklistType}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Falha ao salvar configuração");
      }

      alert("Configuração salva com sucesso!");
      handleCloseModal();
    } catch (err) {
      console.error("Error saving configuration:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao salvar configuração. Tente novamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-default">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-background-default">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleOpenModal}
            className="text-sm font-bold"
          >
            <strong>Configurar janela</strong>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Text
            variant="heading-h1"
            className="hidden sm:block text-2xl font-bold text-brand"
          >
            Checklist
          </Text>
          {/* Mobile title */}
          <Text
            variant="heading-h1"
            className="block sm:hidden text-2xl font-bold text-brand"
          >
            Checklist
          </Text>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Button to start a new checklist */}
          <Button
            variant="solid"
            onClick={() => router.push("/(authenticated)/checklist/nova")}
            className="w-full md:w-auto"
          >
            Iniciar nova checklist
          </Button>

          {/* Placeholder for other content */}
          <div className="text-center py-12">
            <Icon
              name="clipboard-list"
              className="w-12 h-12 mx-auto mb-4 text-muted"
              decorative
            />
            <Text variant="body-md" className="mb-2 text-secondary">
              Selecionar uma turma, sala e template para iniciar uma nova checklist
            </Text>
            <Button
              variant="ghost"
              onClick={() => router.push("/(authenticated)/checklist/nova")}
            >
              Começar agora
            </Button>
          </div>
        </div>
      </main>

      {/* Configuration Modal */}
      {isModalOpen && (
        <>
          {/* Overlay Backdrop usando o token de background do sistema */}
          <div
            className="fixed inset-0 z-50 bg-background-overlay transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-background-default rounded-xl p-6 shadow-xl space-y-6">
              {/* Close button */}
              <Button
                variant="ghost"
                className="absolute top-3 right-3 text-muted p-1"
                onClick={handleCloseModal}
                aria-label="Fechar"
              >
                <Icon name="x" className="w-5 h-5 text-muted" decorative />
              </Button>

              {/* Modal Header */}
              <div>
                <Text variant="heading-h2" className="text-xl font-bold text-brand">
                  Configurar janela de entrega
                </Text>
              </div>

              {/* Modal Body */}
              <div className="space-y-6">
                {/* Class Selection */}
                <div className="space-y-3">
                  <Text variant="label-sm">Turma</Text>
                  <Select
                    options={classOptions}
                    value={selectedClassId}
                    onChange={setSelectedClassId}
                    placeholder="Selecione uma turma"
                    size="sm"
                    aria-label="Turma"
                    clearable
                  />
                  {!selectedClassId && classOptions.length > 0 && (
                    <Text variant="body-sm" className="mt-1 text-critical">
                      Por favor, selecione uma turma
                    </Text>
                  )}
                </div>

                {/* Start Time */}
                <div className="space-y-3">
                  <Text variant="label-sm">
                    Horário de entrada (início da janela)
                  </Text>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full"
                    placeholder="HH:MM"
                  />
                </div>

                {/* End Time */}
                <div className="space-y-3">
                  <Text variant="label-sm">
                    Horário de término da janela
                  </Text>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full"
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="ghost" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  variant="solid"
                  onClick={handleSaveConfig}
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar configurações"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}