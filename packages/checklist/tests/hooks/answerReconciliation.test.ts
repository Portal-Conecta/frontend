import { describe, expect, it } from "vitest";

import {
  answerStateFromResponses,
  mergeAnswersWithExisting,
} from "../../src/hooks/useFillChecklist";
import type { ChecklistAnswerResponse } from "../../src/types/execution";

describe("answerStateFromResponses", () => {
  it("converte respostas da execução pro formato de estado local", () => {
    const answers: ChecklistAnswerResponse[] = [
      {
        itemKey: "iluminacao",
        value: "COMPLIANT",
        compliant: true,
        answeredAt: "2026-07-20T10:00:00Z",
      },
      {
        itemKey: "limpeza",
        value: "NON_COMPLIANT",
        compliant: false,
        observation: "Lixeira cheia",
        answeredAt: "2026-07-20T10:01:00Z",
      },
    ];

    expect(answerStateFromResponses(answers)).toEqual({
      iluminacao: { value: "COMPLIANT" },
      limpeza: { value: "NON_COMPLIANT", observation: "Lixeira cheia" },
    });
  });

  it("retorna objeto vazio quando não há respostas", () => {
    expect(answerStateFromResponses([])).toEqual({});
  });
});

describe("mergeAnswersWithExisting", () => {
  it("preserva respostas já salvas que não foram tocadas localmente", () => {
    // Reproduz o bug: usuário responde só "iluminacao" antes de escolher a
    // turma, mas a execução retomada já tinha "iluminacao" e "limpeza" salvos.
    const existing = {
      iluminacao: { value: "COMPLIANT" as const },
      limpeza: { value: "COMPLIANT" as const },
    };
    const local = {
      iluminacao: { value: "NON_COMPLIANT" as const, observation: "Lâmpada queimada" },
    };

    expect(mergeAnswersWithExisting(existing, local)).toEqual({
      iluminacao: { value: "NON_COMPLIANT", observation: "Lâmpada queimada" },
      limpeza: { value: "COMPLIANT" },
    });
  });

  it("resposta local para item novo soma ao que já existia", () => {
    const existing = { iluminacao: { value: "COMPLIANT" as const } };
    const local = { limpeza: { value: "COMPLIANT" as const } };

    expect(mergeAnswersWithExisting(existing, local)).toEqual({
      iluminacao: { value: "COMPLIANT" },
      limpeza: { value: "COMPLIANT" },
    });
  });

  it("sem resposta local, mantém só o que já existia", () => {
    const existing = { iluminacao: { value: "COMPLIANT" as const } };

    expect(mergeAnswersWithExisting(existing, {})).toEqual(existing);
  });
});
