/** Envelope de erro Spring — compartilhado entre backends WEG/SENAI. */
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
