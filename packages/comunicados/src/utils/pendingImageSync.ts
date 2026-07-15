import type { FileUploadItem } from '@portal/ui'

/**
 * Mensagens e contrato para falha parcial de imagens após save (#398).
 * O wizard de edição (#205) deve espelhar o `pendingPost` do create:
 * - se conteúdo já salvou e o sync falhar, guardar `pendingImageSync.active = true`
 * - no próximo submit, pular save e chamar só `syncAnnouncementImages`
 * - atualizar `images` / `initialImageIds` com o retorno do sync após cada sucesso
 */

export const PENDING_IMAGE_SYNC_ERROR =
  'Alterações salvas, mas não foi possível sincronizar as imagens. Tente novamente — só o sync de imagens será refeito.'

export interface PendingImageSyncState {
  /** Post já persistido; falta só sync de imagens. */
  active: boolean
  images: FileUploadItem[]
  initialImageIds: string[]
}
