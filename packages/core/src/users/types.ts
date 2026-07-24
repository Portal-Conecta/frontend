/** Contratos de `POST /hub/imports/users` e `GET /hub/imports/templates/users` (#441). */

export type ExistingEmailHandling = 'REJECT' | 'SKIP'

export type UserImportRowStatus = 'CREATED' | 'SKIPPED' | 'ERROR'

export interface UserImportRowResult {
  line: number
  status: UserImportRowStatus
  message: string
}

export interface UserImportResult {
  dryRun: boolean
  created: number
  skipped: number
  rows: UserImportRowResult[]
}
