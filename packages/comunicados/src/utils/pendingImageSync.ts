/**
 * Contrato de falha parcial de imagens após save (#398).
 *
 * TODO(#205): consumir em `EditAnnouncementWizard` — espelhar `pendingPost` do
 * create: se o conteúdo já salvou e o sync falhar, setar `active: true` e no
 * próximo submit pular o save, chamar só `syncAnnouncementImages`, atualizando
 * `images` / `initialImageIds` a cada `onProgress`. Sem consumidor nesta branch.
 *
 * @see https://github.com/Portal-Conecta/frontend/issues/205
 */

import type { FileUploadItem } from '@portal/ui'

export const PENDING_IMAGE_SYNC_ERROR =
  'Alterações salvas, mas não foi possível sincronizar as imagens. Tente novamente — só o sync de imagens será refeito.'

export interface PendingImageSyncState {
  /** Post já persistido; falta só sync de imagens. */
  active: boolean
  images: FileUploadItem[]
  initialImageIds: string[]
}
