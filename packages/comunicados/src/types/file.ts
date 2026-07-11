/** Espelha `AnnouncementFileType` do comunicados-backend. */
export type AnnouncementFileType = 'IMAGE' | 'DOCUMENT' | 'VIDEO'

/** Espelha `AnnouncementFileStatus` do comunicados-backend. */
export type AnnouncementFileStatus = 'PENDING' | 'READY' | 'FAILED'

/** Espelha `AnnouncementFileResponse` do comunicados-backend. */
export interface AnnouncementFile {
  id: string
  announcementId: string
  originalName: string
  s3Key: string
  s3Bucket: string
  processedS3Key?: string | null
  /** URL de exibição — deve apontar ao bucket/path processed. */
  displayUrl?: string | null
  contentType: string
  type: AnnouncementFileType
  fileStatus?: AnnouncementFileStatus
  sizeBytes: number
  isThumbnail: boolean
  uploadedByUserId: string
  createdAt: string
}
