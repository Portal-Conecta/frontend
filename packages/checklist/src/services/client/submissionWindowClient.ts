import type { SubmissionWindowResponse } from "../../types/submissionWindow";
import { ExecutionClientError } from "./executionClient";

export async function getClassSubmissionWindowsClient(
  classId: string,
): Promise<SubmissionWindowResponse[]> {
  const url = `/api/checklist/submission-windows/classes/${classId}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (cause) {
    const hint =
      cause instanceof Error && "cause" in cause && cause.cause instanceof Error
        ? cause.cause.message
        : cause instanceof Error
        ? cause.message
        : undefined;
    throw new ExecutionClientError(
      "network",
      503,
      [],
      hint ? `Falha ao conectar em ${url}: ${hint}` : `Falha ao conectar em ${url}`,
    );
  }

  if (res.ok) {
    try {
      return (await res.json()) as SubmissionWindowResponse[];
    } catch {
      throw new ExecutionClientError("server", 502);
    }
  }

  // Se der erro, tenta parsear no formato da BFF, ou lança genérico
  let message;
  try {
    const body = await res.json();
    message = body?.message;
  } catch {
    // ignorar falha no parse do json de erro
  }

  throw new ExecutionClientError("server", res.status, [], message);
}
