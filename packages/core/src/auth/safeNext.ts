/**
 * safeNext — sanitiza o parâmetro `next` de redirect pós-refresh.
 *
 * Lógica pura (sem React, sem `next/headers`): Edge-safe e testável com Vitest.
 *
 * Evita open redirect. NÃO basta checar a string crua (ex.: `!startsWith('//')`):
 * o WHATWG URL parser remove tab/LF/CR e normaliza `\` antes de resolver, então
 * `/\t/evil.com` ou `/\evil.com` viram `//evil.com` → host externo. A defesa
 * correta é resolver a URL contra a `base` e exigir mesma origin; só então o
 * caminho relativo é devolvido. Qualquer entrada suspeita cai no fallback.
 */

const FALLBACK = '/comunicados'

export function safeNext(raw: string | null, base: string): string {
  if (raw) {
    try {
      const url = new URL(raw, base)
      if (url.origin === new URL(base).origin && url.pathname.startsWith('/')) {
        return url.pathname + url.search
      }
    } catch {
      // URL inválida → fallback.
    }
  }
  return FALLBACK
}
