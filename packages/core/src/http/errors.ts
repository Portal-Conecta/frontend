import type { ApiError } from "@portal/shared";

export type HttpErrorKind =
  | "not_found"
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "server"
  | "network";

export class HttpError extends Error {
  constructor(
    public readonly kind: HttpErrorKind,
    public readonly status?: number,
    public readonly body?: ApiError,
    message?: string,
    options?: { cause?: unknown },
  ) {
    super(message ?? kind, options);
    this.name = "HttpError";
  }
}

export function mapStatusToKind(status: number): HttpErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 400 || status === 422) return "validation";
  return "server";
}

/**
 * Status HTTP a devolver para um erro do http client. Reaproveita o `status`
 * original do back já preservado no `HttpError`, em vez de remontar uma tabela
 * `kind → status`. Só os erros sem resposta — sessão ausente (`unauthorized`) e
 * falha de rede — não têm status e caem no fallback (401 / 503). Qualquer coisa
 * que não seja `HttpError` vira 503.
 */
export function httpErrorStatus(err: unknown): number {
  if (err instanceof HttpError) {
    return err.status ?? (err.kind === "unauthorized" ? 401 : 503);
  }
  return 503;
}
