import type {
  ChecklistType,
  SubmissionWindowResponse,
} from "../types/submissionWindow";

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Encontra o `checklistType` cuja janela de submissão está aberta agora,
 * a partir das janelas configuradas para a turma. Retorna `null` se nenhuma
 * janela estiver aberta no momento.
 */
export function findOpenChecklistType(
  windows: SubmissionWindowResponse[],
  now: Date = new Date(),
): ChecklistType | null {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const open = windows.find((window) => {
    const start = toMinutes(window.openAt);
    const end = start + window.durationMinutes;
    return nowMinutes >= start && nowMinutes < end;
  });

  return open?.checklistType ?? null;
}

/**
 * Tipo de checklist a preencher para a turma, a partir das janelas
 * configuradas — mesmo que nenhuma esteja aberta agora. Prefere a janela
 * aberta; senão, cai na primeira configurada (o preenchimento é liberado a
 * qualquer hora; só o envio valida o horário). Retorna `null` só quando a
 * turma não tem nenhuma janela configurada.
 */
export function resolveChecklistType(
  windows: SubmissionWindowResponse[],
  now: Date = new Date(),
): ChecklistType | null {
  return (
    findOpenChecklistType(windows, now) ?? windows[0]?.checklistType ?? null
  );
}
