/**
 * Tipos do formulário de criação de comunicado (#197, modo criar).
 *
 * O fluxo é um wizard: etapa 1 = conteúdo (imagens + título + descrição), etapa 2
 * = destinatários (#195) e etapa 3 = publicar/agendar (#196). Estes tipos cobrem
 * a etapa 1; as demais entram quando os componentes chegarem à branch.
 */
import type { FileUploadItem } from '@portal/ui'

/** Conteúdo da etapa 1 do wizard. Imagem escolhida no `FileUpload` do DS (#250). */
export interface AnnouncementContentValue {
  images: FileUploadItem[]
  title: string
  description: string
}

/** Erros por campo da etapa 1 (mensagens vindas de validação/back). */
export type AnnouncementContentErrors = Partial<
  Record<keyof AnnouncementContentValue, string>
>

export const EMPTY_ANNOUNCEMENT_CONTENT: AnnouncementContentValue = {
  images: [],
  title: '',
  description: '',
}
