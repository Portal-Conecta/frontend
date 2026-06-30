/**
 * Envelope de erro Spring. Tipo compartilhado entre backends WEG/SENAI —
 * candidato a `@portal/shared` (ver PR #218).
 */
export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  errors?: ApiFieldError[] | null
}
