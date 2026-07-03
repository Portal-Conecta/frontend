export type QueryParamValue = string | number | boolean | string[] | undefined | null

export type QueryParams = Record<string, QueryParamValue>

export function buildQuery(params?: QueryParams): string {
  if (!params) return ''

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== '') search.append(key, item)
      }
      continue
    }
    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}
