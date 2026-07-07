/**
 * Testes do service client de comunicados (`services/client/announcementsClient`).
 *
 * As funções batem no BFF de mesma origem via `bffFetch`, que usa o `fetch`
 * global — então trocamos o `fetch` por um dublê (`vi.stubGlobal`) para inspecionar
 * caminho/método/body e controlar status e corpo da resposta.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deleteAnnouncementClient,
  listAnnouncementsClient,
  listMyAnnouncementsClient,
  pinAnnouncementClient,
  unpinAnnouncementClient,
} from "../../src/services/client/announcementsClient";

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function stubFetch() {
  const mock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", mock);
  return mock;
}

const listResponse = {
  items: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listAnnouncementsClient / listMyAnnouncementsClient", () => {
  it("lista o mural em GET /api/comunicados/posts com a query montada", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(response(200, listResponse));

    await expect(
      listAnnouncementsClient({ page: 0, size: 20 }),
    ).resolves.toEqual(listResponse);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/comunicados/posts?page=0&size=20");
    expect(init?.method).toBeUndefined();
  });

  it("lista os próprios em GET /api/comunicados/posts/mine", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(response(200, listResponse));

    await expect(
      listMyAnnouncementsClient({ search: "prova" }),
    ).resolves.toEqual(listResponse);

    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/comunicados/posts/mine?search=prova");
  });
});

describe("deleteAnnouncementClient", () => {
  it("faz DELETE e resolve sem corpo no 204", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(response(204, null));

    await expect(deleteAnnouncementClient("a1")).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/comunicados/posts/a1");
    expect(init?.method).toBe("DELETE");
  });

  it("mapeia 403 para HttpError forbidden", async () => {
    stubFetch().mockResolvedValue(response(403, {}));
    await expect(deleteAnnouncementClient("a1")).rejects.toMatchObject({
      kind: "forbidden",
    });
  });
});

describe("pinAnnouncementClient / unpinAnnouncementClient", () => {
  it("faz PATCH em /pin com pinnedOrder no body", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(response(200, { id: "a1", pinned: true }));

    await expect(pinAnnouncementClient("a1", 2)).resolves.toMatchObject({
      pinned: true,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/comunicados/posts/a1/pin");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(init?.body as string)).toEqual({ pinnedOrder: 2 });
  });

  it("faz PATCH em /unpin", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(response(200, { id: "a1", pinned: false }));

    await expect(unpinAnnouncementClient("a1")).resolves.toMatchObject({
      pinned: false,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/comunicados/posts/a1/unpin");
    expect(init?.method).toBe("PATCH");
  });
});
