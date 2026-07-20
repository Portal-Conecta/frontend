import type { ApiError, ApiFieldError } from "@portal/shared";
import type {
  ChecklistExecutionDraftCreateRequest,
  ChecklistExecutionResponse,
  ChecklistExecutionSubmitRequest,
} from "../../types/execution";

export type ExecutionErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "window_violation"
  | "server"
  | "network";

export class ExecutionClientError extends Error {
  constructor(
    public readonly kind: ExecutionErrorKind,
    public readonly status: number,
    public readonly fieldErrors: ApiFieldError[] = [],
    message?: string,
  ) {
    super(message ?? kind);
    this.name = "ExecutionClientError";
  }
}

async function readApiError(res: Response): Promise<ApiError | undefined> {
  try {
    return (await res.json()) as ApiError;
  } catch {
    return undefined;
  }
}

async function toExecutionError(res: Response): Promise<ExecutionClientError> {
  const apiError = await readApiError(res);
  const fieldErrors = apiError?.errors ?? [];
  const message = apiError?.message;

  switch (res.status) {
    case 400:
      return new ExecutionClientError("validation", 400, fieldErrors, message);
    case 401:
      return new ExecutionClientError("unauthorized", 401, fieldErrors, message);
    case 403:
      return new ExecutionClientError("forbidden", 403, fieldErrors, message);
    case 404:
      return new ExecutionClientError("not_found", 404, fieldErrors, message);
    case 409:
      return new ExecutionClientError("conflict", 409, fieldErrors, message);
    case 422:
      // Submissão fora da janela ou regra de negócio impeditiva
      return new ExecutionClientError(
        "window_violation",
        422,
        fieldErrors,
        message,
      );
    default:
      return new ExecutionClientError("server", res.status, fieldErrors, message);
  }
}

async function doFetch<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
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
      return (await res.json()) as T;
    } catch {
      throw new ExecutionClientError("server", 502);
    }
  }

  throw await toExecutionError(res);
}

export async function createDraftClient(
  body: ChecklistExecutionDraftCreateRequest,
): Promise<ChecklistExecutionResponse> {
  return doFetch<ChecklistExecutionResponse>("/api/checklist/executions/drafts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function submitExecutionClient(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return doFetch<ChecklistExecutionResponse>(
    `/api/checklist/executions/${executionId}/submit`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function cancelExecutionClient(
  executionId: string,
): Promise<ChecklistExecutionResponse> {
  return doFetch<ChecklistExecutionResponse>(
    `/api/checklist/executions/${executionId}/cancel`,
    { method: "PATCH" },
  );
}
