/** Espelha `ApiError` do comunicados-backend. */
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
