/** Extrai e normaliza o `id` de rota `/api/users/[id]/...`. */
export async function userIdFrom(params: Promise<{ id: string }>): Promise<string | null> {
  const { id } = await params
  const normalized = id?.trim()
  return normalized || null
}
