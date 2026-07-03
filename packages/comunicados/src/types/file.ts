/** Espelha `AnnouncementFileType` do comunicados-backend. */
export type AnnouncementFileType = 'IMAGE' | 'DOCUMENT' | 'VIDEO'

/** Espelha `AnnouncementFileResponse` do comunicados-backend. */
export interface AnnouncementFile {
  id: string
  announcementId: string
  originalName: string
  s3Key: string
  s3Bucket: string
  contentType: string
  type: AnnouncementFileType
  sizeBytes: number
  isThumbnail: boolean
  uploadedByUserId: string
  createdAt: string
}
