import { describe, expect, it } from "vitest";

import { HttpError, httpErrorStatus } from "../../src/http/errors";

describe("httpErrorStatus", () => {
  it("reaproveita o status original do HttpError", () => {
    expect(httpErrorStatus(new HttpError("not_found", 404))).toBe(404);
    expect(httpErrorStatus(new HttpError("validation", 422))).toBe(422);
    expect(httpErrorStatus(new HttpError("forbidden", 403))).toBe(403);
  });

  it("mapeia unauthorized sem status para 401", () => {
    expect(httpErrorStatus(new HttpError("unauthorized"))).toBe(401);
  });

  it("mapeia erro sem status (network) para 503", () => {
    expect(httpErrorStatus(new HttpError("network"))).toBe(503);
  });

  it("mapeia erro que não é HttpError para 503", () => {
    expect(httpErrorStatus(new Error("boom"))).toBe(503);
    expect(httpErrorStatus("erro cru")).toBe(503);
  });
});
