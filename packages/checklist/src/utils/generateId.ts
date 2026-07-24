/**
 * `crypto.randomUUID()` só existe em contexto seguro (HTTPS ou `localhost`) —
 * um link de apresentação servido por HTTP puro (ex.: IP/DNS da AWS sem TLS)
 * quebra com `TypeError: crypto.randomUUID is not a function`, que não é um
 * `HttpError` e cai no fallback genérico de erro (ver PageChecklistTemplateManagerContent).
 * `crypto.getRandomValues()` não tem essa restrição — usamos ele pra montar
 * o UUID v4 manualmente. Só cai pro `Math.random()` se `crypto` não existir
 * de jeito nenhum (não é criptograficamente forte, mas isso aqui é só uma
 * chave de item de schema, não segredo).
 */
export function generateItemKey(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6]! & 0x0f) | 0x40; // versão 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variante RFC 4122
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
