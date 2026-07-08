/** Body de `POST /api/posts/{postId}/images/presign`. */
export interface PresignUploadRequest {
  contentType: string
  originalName: string
  sizeBytes?: number
  thumbnail?: boolean
}

/** Resposta do presign — PUT direto ao S3 com `Content-Type` informado no request. */
export interface PresignUploadResponse {
  fileId: string
  uploadUrl: string
  fields: Record<string, string>
}

/** Resultado do upload via presign no wizard (#198). */
export interface PresignedImageUploadResult {
  fileId: string
}
