import { describe, expect, it } from "vitest";

import type { ApiError } from "@portal/shared";

import { HttpError } from "../../src/http/errors";
import { bffErrorResponse } from "../../src/http/bffError";

const apiError: ApiError = {
  timestamp: "2026-07-14T00:00:00Z",
  status: 401,
  error: "Unauthorized",
  message: "Token expirado",
  path: "/hub/me",
};

describe("bffErrorResponse", () => {
  it("propaga kind, status e message de um HttpError", async () => {
    const res = bffErrorResponse(new HttpError("unauthorized", 401, apiError));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      code: "unauthorized",
      message: "Token expirado",
      errors: [],
    });
  });

  it('cai em 503 / code "server" para erro que não é HttpError', async () => {
    const res = bffErrorResponse(new Error("boom"));
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ code: "server" });
  });
});
