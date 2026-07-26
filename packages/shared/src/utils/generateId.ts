/**
 * Gera um identificador local para listas e `key` de React.
 *
 * `crypto.randomUUID()` só existe em contexto seguro (HTTPS ou `localhost`) —
 * é assim por especificação da Web Platform, não é bug de lógica. Uma demo
 * servida por HTTP puro num host que não é `localhost` (ex.: IP/DNS da AWS sem
 * TLS) quebra com `TypeError: crypto.randomUUID is not a function`, derrubando
 * o handler antes de ele atualizar o estado — sem erro visível na tela. Por não
 * reproduzir em `localhost`, o bug passa batido no desenvolvimento local.
 *
 * `crypto.getRandomValues()` não tem essa restrição — usamos ele para montar o
 * UUID v4 manualmente. Só cai no `Math.random()` se `crypto` não existir de
 * jeito nenhum: não é criptograficamente forte, mas o valor é apenas uma chave
 * local de lista — nunca é persistido nem enviado ao servidor.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6]! & 0x0f) | 0x40 // versão 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80 // variante RFC 4122
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join(''),
    ].join('-')
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
